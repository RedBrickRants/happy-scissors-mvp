from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment
from staff.permissions import IsAdminUserCustom
from staff.models import Staff
from users.models import CustomUser
from services.models import Service

# List all appointments, with optional date filtering
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def appointment_list(request):
    date_str = request.GET.get('date')
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            appointments = Appointment.objects.filter(scheduled_time__date=target_date)
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=400)
    else:
        appointments = Appointment.objects.all()
    
    appointments_data = []
    for appointment in appointments.select_related('client', 'staff__user', 'service'):
        appointments_data.append({
            'id': appointment.id,
            'client_name': appointment.client.username,
            'service_name': appointment.service.name,
            'staff_name': appointment.staff.user.username,
            'start_time': appointment.scheduled_time.isoformat(),
            'end_time': appointment.end_time.isoformat() if appointment.end_time else None,
            'status': appointment.status,
            'price': float(appointment.service.price)
        })
    
    return Response(appointments_data)

# Update appointment status (admin only)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def update_appointment(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)
    
    if 'status' in request.data:
        appointment.status = request.data['status']
        appointment.save()
        return Response({'message': 'Appointment status updated successfully'})
    
    return Response({'error': 'No status provided'}, status=400)

# make an appointment (authenticated users)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def make_appointment(request):
    #creates new appointment 
    #Clients can make appointments for only themselves
    #staff can make appointments for any client 
    try:
        if request.user.is_client_user():
            client_user = request.user
        else:
            client_id = request.data.get('client')
            if not client_id:
                return Response({'error': 'Client ID is required'}, status=400)
            try:
                client_user = CustomUser.objects.get(id=client_id, user_type='client')
            except CustomUser.DoesNotExist:
                return Response({'error': 'Client not found'}, status=404)
        
        service_id = request.data.get('service')
        staff_id = request.data.get('staff')
        scheduled_time = request.data.get('scheduled_time')
        notes = request.data.get('notes', '')

        if not service_id or not staff_id or not scheduled_time:
            return Response({'error': 'Service, Staff, and Scheduled Time are required'}, status=400)
        
        try:
            service = Service.objects.get(id=service_id, active=True)
        except Service.DoesNotExist:
            return Response({'error': 'Service not found or inactive'}, status=404)
        try:
            staff = Staff.objects.get(id=staff_id, is_active=True)
        except Staff.DoesNotExist:  
            return Response({'error': 'Staff not found or inactive'}, status=404)           
        
        if not staff.services.filter(id=service.id).exists():
            return Response({'error': 'Selected staff is not qualified for the chosen service'}, status=400)   

        try:
            scheduled_time = datetime.fromisoformat(scheduled_time)
        except (ValueError, AttributeError):     
            return Response({'error': 'Invalid scheduled time format'}, status=400)
        
        if scheduled_time < timezone.now():
            return Response({'error': 'Scheduled time must be in the future'}, status=400)
        
        existing_appointments = Appointment.objects.filter(
            staff=staff,
            scheduled_time__date=scheduled_time.date(),
            status__in=['booked', 'confirmed']
        )

        for existing_appointment in existing_appointments:
            existing_end = existing_appointment.end_time or existing_appointment.scheduled_time+ timedelta(minutes=existing_appointment.service.duration)
            new_end = scheduled_time + timedelta(minutes=service.duration)

            if scheduled_time < existing_end and new_end > existing_appointment.scheduled_time:
                return Response({'error': 'The selected staff member is not available at the requested time'}, status=400)
            
        appointment = Appointment.objects.create(
            client=client_user,
            staff=staff,
            service=service,
            scheduled_time=scheduled_time,
            notes=notes,
            status='booked'
        )
        return Response({'message': 'Appointment created successfully', 'appointment_id': appointment.id})
    except Exception:
        return Response({'error': str(Exception)}, status=500)
