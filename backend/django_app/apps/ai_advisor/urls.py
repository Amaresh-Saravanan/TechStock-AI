from django.urls import path
from .views import ChatView, BuildGeneratorView, DashboardView, ChatStatusView, AnalyticsView, RecommendationsView, AlertsView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='ai_chat'),
    path('generate-build/', BuildGeneratorView.as_view(), name='ai_generate_build'),
    path('analytics/dashboard/', DashboardView.as_view(), name='analytics_dashboard'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
    path('alerts/', AlertsView.as_view(), name='alerts'),
    path('chat/status/', ChatStatusView.as_view(), name='chat_status'),
]
