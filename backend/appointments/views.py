from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime
from .models import Appointment
from staff.permissions import IsAdminUserCustom

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