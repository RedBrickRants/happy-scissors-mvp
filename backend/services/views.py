from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Service
from staff.permissions import IsAdminUserCustom

# List all active services
@api_view(['GET'])
@permission_classes([AllowAny])
def service_list(request):
    services = Service.objects.filter(active=True)
    services_data = []
    for service in services:
        services_data.append({
            'id': service.id,
            'name': service.name,
            'description': service.description,
            'duration': service.duration,
            'price': float(service.price)
        })
    return Response(services_data)

# Create a new service (admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def service_create(request):
    name = request.data.get('name')
    duration = request.data.get('duration_mins')
    price = request.data.get('price')
    
    if not name or not duration or not price:
        return Response({'error': 'Name, duration, and price are required'}, status=400)
    
    service = Service.objects.create(
        name=name,
        duration=duration,
        price=price
    )
    
    return Response({'message': 'Service created successfully', 'service_id': service.id})