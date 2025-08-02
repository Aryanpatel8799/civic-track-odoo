import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue, LocationCoordinates } from '@/types';
import { MapPin } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center: LocationCoordinates;
  zoom?: number;
  height?: string;
  issues?: Issue[];
  selectedIssue?: Issue | null;
  onIssueClick?: (issue: Issue) => void;
  onLocationSelect?: (location: LocationCoordinates) => void;
  showLocationSelector?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  height = '400px',
  issues = [],
  selectedIssue,
  onIssueClick,
  onLocationSelect,
  showLocationSelector = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Validate center coordinates
    const validLat = typeof center.lat === 'number' && !isNaN(center.lat) ? center.lat : 23.0225;
    const validLng = typeof center.lng === 'number' && !isNaN(center.lng) ? center.lng : 72.5714;

    const map = L.map(mapRef.current).setView([validLat, validLng], zoom);

    // Add OpenStreetMap tile layer with better configuration
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
      detectRetina: true
    }).addTo(map);

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      metric: true,
      imperial: false
    }).addTo(map);

    // Add zoom control with custom position
    map.zoomControl.setPosition('topright');

    // Add marker group to map
    markersRef.current.addTo(map);

    // Handle location selection
    if (showLocationSelector && onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat, lng });
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
    };
  }, [center.lat, center.lng, zoom, showLocationSelector, onLocationSelect]);

    // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Validate center coordinates before updating
      const validLat = typeof center.lat === 'number' && !isNaN(center.lat) ? center.lat : 23.0225;
      const validLng = typeof center.lng === 'number' && !isNaN(center.lng) ? center.lng : 72.5714;
      
      mapInstanceRef.current.setView([validLat, validLng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // Update markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add issue markers
    issues.forEach(issue => {
      try {
        // Safely extract coordinates with fallback
        const coordinates = issue.location?.coordinates;
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
          console.warn('Invalid coordinates for issue:', issue._id, 'coordinates:', coordinates);
          return;
        }
        
        const [lng, lat] = coordinates;
        
        // Validate coordinates are valid numbers
        if (typeof lat !== 'number' || typeof lng !== 'number' || 
            isNaN(lat) || isNaN(lng)) {
          console.warn('Invalid coordinate values for issue:', issue._id, { lat, lng });
          return;
        }
        
        // Create custom icon based on status with enhanced Leaflet styling
        const iconColor = {
          'Reported': '#f59e0b',
          'In Progress': '#3b82f6',
          'Resolved': '#10b981'
        }[issue.status];

        const customIcon = L.divIcon({
          html: `
            <div class="civic-marker" style="
              background-color: ${iconColor};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: white;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              <span style="margin-top: -1px;">${issue.category[0]}</span>
            </div>
          `,
          className: 'custom-civic-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        });

        const marker = L.marker([lat, lng], { 
          icon: customIcon,
          riseOnHover: true,
          riseOffset: 250
        })
          .bindPopup(`
            <div class="civic-popup" style="min-width: 220px; max-width: 300px;">
              <h4 style="margin: 0 0 10px 0; font-weight: 600; color: #1f2937; font-size: 16px; line-height: 1.4;">
                ${issue.title}
              </h4>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">
                ${issue.description.substring(0, 120)}${issue.description.length > 120 ? '...' : ''}
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="
                  background-color: ${iconColor};
                  color: white;
                  padding: 4px 10px;
                  border-radius: 16px;
                  font-size: 11px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">
                  ${issue.status}
                </span>
                <span style="color: #6b7280; font-size: 12px; font-weight: 500;">
                  📍 ${issue.category}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #10b981;">👍</span> ${issue.upvotes}
                </span>
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #6b7280;">👁️</span> ${issue.views}
                </span>
                <span style="font-size: 10px; color: #9ca3af;">
                  Click for details
                </span>
              </div>
            </div>
          `, {
            maxWidth: 320,
            closeButton: true,
            autoPan: true,
            closeOnEscapeKey: true,
            className: 'civic-leaflet-popup'
          });

        // Add tooltip for quick info on hover
        marker.bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;">
            <strong>${issue.title}</strong><br/>
            <span style="color: ${iconColor};">● ${issue.status}</span> • ${issue.category}
          </div>
        `, {
          direction: 'top',
          offset: [0, -5],
          opacity: 0.9,
          className: 'civic-tooltip'
        });

        // Enhanced click and hover interactions
        if (onIssueClick) {
          marker.on('click', () => onIssueClick(issue));
        }

        // Add hover effects
        marker.on('mouseover', function(this: L.Marker) {
          this.openTooltip();
        });

        marker.on('mouseout', function(this: L.Marker) {
          this.closeTooltip();
        });

        markersRef.current.addLayer(marker);
      } catch (error) {
        console.error('Error processing issue marker:', issue._id, error);
      }
    });

    // Fit bounds to show all markers if there are issues
    if (issues.length > 0) {
      try {
        const group = new L.FeatureGroup(markersRef.current.getLayers());
        if (group.getBounds().isValid()) {
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [issues, onIssueClick]);

  // Highlight selected issue
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedIssue) return;
    
    try {
      // Safely extract coordinates with fallback
      const coordinates = selectedIssue.location?.coordinates;
      if (!coordinates || coordinates.length !== 2) {
        console.warn('Selected issue has invalid coordinates:', selectedIssue._id, coordinates);
        return;
      }
      
      const [lng, lat] = coordinates;
      
      // Validate coordinates are valid numbers
      if (typeof lat !== 'number' || typeof lng !== 'number' || 
          isNaN(lat) || isNaN(lng)) {
        console.warn('Selected issue has invalid coordinate values:', selectedIssue._id, { lat, lng });
        return;
      }
      
      // Center map on selected issue
      mapInstanceRef.current.setView([lat, lng], 16);
      
      // Open popup for selected marker
      markersRef.current.eachLayer((layer: any) => {
        if (layer.getLatLng && 
            Math.abs(layer.getLatLng().lat - lat) < 0.0001 && 
            Math.abs(layer.getLatLng().lng - lng) < 0.0001) {
          layer.openPopup();
        }
      });
    } catch (error) {
      console.error('Error highlighting selected issue:', selectedIssue._id, error);
    }
  }, [selectedIssue]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className="z-0"
    />
  );
};