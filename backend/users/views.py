from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from appointments.models import Appointment
from staff.permissions import IsAdminUserCustom


User = get_user_model()

#allows for admin to see all clients
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

#allows for admin to see all appointments of a specific client
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

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Public endpoint for client registration
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    phone = request.data.get('phone', '')
    
    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    try:
        # Create user with client type
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            user_type='client'  # Always set as client for public registration
        )
        
        return Response({
            'message': 'Client account created successfully! Please login.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=201)
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)