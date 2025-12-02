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

# Delete a service (admin only)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def service_delete(request, service_id):
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({'error': 'Service not found'}, status=404)
    service.active = False
    service.save()
    
    return Response({'message': 'Service deleted successfully'})

# Create a new service (admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def service_create(request):
    name = request.data.get('name')
    duration = request.data.get('duration')
    price = request.data.get('price')
    
    if not name or not duration or not price:
        return Response({'error': 'Name, duration, and price are required'}, status=400)
    
    service = Service.objects.create(
        name=name,
        duration=duration,
        price=price
    )
    
    return Response({'message': 'Service created successfully', 'service_id': service.id})

# Edit an existing service (admin only)
@api_view(['GET', 'PUT'])  
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def service_edit(request, service_id):
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({'error': 'Service not found'}, status=404)
    
    if request.method == 'GET':
        return Response({
            'id': service.id,
            'name': service.name,
            'duration': service.duration,
            'price': float(service.price)
        })
    
    elif request.method == 'PUT':
        # Update fields
        service.name = request.data.get('name', service.name)
        service.duration = request.data.get('duration', service.duration)
        service.price = request.data.get('price', service.price)
        
        try:
            service.save()
            return Response({'message': 'Service updated successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

