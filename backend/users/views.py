from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from appointments.models import Appointment
from staff.permissions import IsAdminUserCustom
import time
import re


User = get_user_model()

def generate_username(first_name, last_name):
    """Generate a unique username from first and last name"""
    # Clean and lowercase the names
    clean_first = re.sub(r'[^a-zA-Z0-9]', '', first_name).lower()
    clean_last = re.sub(r'[^a-zA-Z0-9]', '', last_name).lower()
    
    # Try different patterns
    patterns = [
        f"{clean_first}.{clean_last}",      # john.smith
        f"{clean_first[0]}{clean_last}",    # jsmith
        f"{clean_first}{clean_last[0]}",    # johns
        f"{clean_first}_{clean_last}",      # john_smith
        f"{clean_first}{clean_last}",       # johnsmith
    ]
    
    for pattern in patterns:
        if len(pattern) >= 4:  # Minimum username length
            base = pattern
            if not User.objects.filter(username=base).exists():
                return base
            
            # Try with numbers if base exists
            for i in range(1, 100):
                numbered = f"{base}{i}"
                if not User.objects.filter(username=numbered).exists():
                    return numbered
    
    # Fallback: timestamp-based
    return f"user{int(time.time())}"

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
    Generates username automatically from first and last name
    """
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    phone = request.data.get('phone', '')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)
    
    if not first_name or not last_name:
        return Response({'error': 'First and last name are required'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    try:
        # Generate username from first and last name
        username = generate_username(first_name, last_name)
        
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
            'message': 'Client account created successfully!',
            'generated_username': username,  # Send back the generated username
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
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get or update user profile
    """
    user = request.user
    
    if request.method == 'GET':
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'user_type': user.user_type
        })
    
    elif request.method == 'PUT':
        # Update user profile
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.phone = request.data.get('phone', user.phone)
        user.email = request.data.get('email', user.email)
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'user_type': user.user_type
            }
        })