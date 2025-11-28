from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from appointments.models import Appointment
from staff.models import Staff
from services.models import Service
from staff.permissions import IsAdminUserCustom

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserCustom])
def dashboard_overview(request):
    today = timezone.now().date()
    todays_appointments = Appointment.objects.filter(scheduled_time__date=today)
    
    stats = {
        'today_appointments_count': todays_appointments.count(),
        'today_revenue': float(sum(app.service.price for app in todays_appointments.filter(status='completed'))),
        'total_staff': Staff.objects.filter(is_active=True).count(),
        'total_services': Service.objects.filter(active=True).count(),
        'appointments_sample': [
            {
                'id': app.id,
                'client_name': app.client.username,
                'service_name': app.service.name,
                'scheduled_time': app.scheduled_time.isoformat(),
                'status': app.status
            }
            for app in todays_appointments[:5]
        ]
    }
    return Response(stats)