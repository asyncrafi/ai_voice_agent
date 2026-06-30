from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import PolicyDocument
from .serializers import PolicyDocumentSerializer, PolicyDocumentListSerializer


class PolicyDocumentListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        docs = PolicyDocument.objects.all().order_by('-upload_date')

        # filters
        status_filter = request.query_params.get('status')
        date_from     = request.query_params.get('date_from')
        date_to       = request.query_params.get('date_to')
        search        = request.query_params.get('search')
        category      = request.query_params.get('category')

        if status_filter and status_filter != 'all':
            docs = docs.filter(status=status_filter)
        if date_from:
            docs = docs.filter(upload_date__date__gte=date_from)
        if date_to:
            docs = docs.filter(upload_date__date__lte=date_to)
        if search:
            docs = docs.filter(
                Q(name__icontains=search) |
                Q(category__icontains=search) |
                Q(tags__icontains=search)
            )
        if category:
            docs = docs.filter(category__icontains=category)

        # pagination
        page      = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        start     = (page - 1) * page_size
        end       = start + page_size
        total     = docs.count()

        return Response({
            "count":    total,
            "page":     page,
            "pages":    (total + page_size - 1) // page_size,
            "results":  PolicyDocumentListSerializer(docs[start:end], many=True).data,
        })

    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        serializer = PolicyDocumentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            doc = serializer.save()
            # Mark as active after upload
            doc.status = PolicyDocument.ACTIVE
            doc.save()
            return Response(PolicyDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PolicyDocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self, pk):
        try:
            return PolicyDocument.objects.get(pk=pk)
        except PolicyDocument.DoesNotExist:
            return None

    def get(self, request, pk):
        doc = self.get_object(pk)
        if not doc:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(PolicyDocumentSerializer(doc).data)

    def patch(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        doc = self.get_object(pk)
        if not doc:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = PolicyDocumentSerializer(
            doc, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Admin only."}, status=status.HTTP_403_FORBIDDEN)
        doc = self.get_object(pk)
        if not doc:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        doc.delete()
        return Response({"message": "Deleted."}, status=status.HTTP_204_NO_CONTENT)

