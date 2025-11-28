from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Staff
from services.models import Service
from staff.permissions import IsAdminUserCustom

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def staff_list(request):
    staff_members = Staff.objects.filter(is_active=True).select_related('user')
    
    staff_data = []
    for staff in staff_members:
        staff_data.append({
            'id': staff.id,
            'name': staff.user.get_full_name() or staff.user.username,
            'email': staff.user.email,
            'expertise': staff.expertise,
            'services': [service.name for service in staff.services.all()],
            'is_active': staff.is_active,
        })
    
    return Response(staff_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def staff_create(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    expertise = request.data.get('expertise', '')
    
    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required'}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=400)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        user_type='staff'
    )
    
    staff = Staff.objects.create(user=user, expertise=expertise)
    
    # Add services if provided
    service_ids = request.data.get('services', [])
    for service_id in service_ids:
        try:
            service = Service.objects.get(id=service_id)
            staff.services.add(service)
        except Service.DoesNotExist:
            pass
    
    return Response({'message': 'Staff created successfully', 'staff_id': staff.id})