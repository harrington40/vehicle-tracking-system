import React from 'react';
import { View, Text, FlatList } from 'react-native';

const typeLabel = t => {
  switch (t) {
    case 'GEOFENCE_ENTER': return 'Enter';
    case 'GEOFENCE_EXIT': return 'Exit';
    case 'GEOFENCE_DWELL': return 'Dwell';
    case 'GEOFENCE_SPEED': return 'Speed Alert';
    default: return t;
  }
};

export default function GeofenceEventList({ events }) {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={events}
        keyExtractor={(_, i) => String(i)}
        style={{ maxHeight: 220 }}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6, borderBottomWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 12, fontWeight: '600' }}>
              {typeLabel(item.type)} · Veh {item.vehicleId} · GF {item.geofenceId}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ fontSize: 12, color: '#64748b' }}>No geofence events yet</Text>}
      />
    </View>
  );
}