from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from appointments.models import Appointment
from staff.permissions import IsAdminUserCustom

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def client_list(request):
    clients = User.objects.filter(user_type='client')
    clients_data = []
    for client in clients:
        clients_data.append({
            'id': client.id,
            'username': client.username,
            'email': client.email,
            'phone': client.phone,
        })
    return Response(clients_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def client_appointments(request, client_id):
    try:
        client = User.objects.get(id=client_id, user_type='client')
    except User.DoesNotExist:
        return Response({'error': 'Client not found'}, status=404)
    
    appointments = Appointment.objects.filter(client=client).select_related('service', 'staff__user')
    appointments_data = []
    for appointment in appointments:
        appointments_data.append({
            'id': appointment.id,
            'service_name': appointment.service.name,
            'staff_name': appointment.staff.user.username,
            'scheduled_time': appointment.scheduled_time.isoformat(),
            'status': appointment.status,
            'price': float(appointment.service.price)
        })
    
    return Response(appointments_data)