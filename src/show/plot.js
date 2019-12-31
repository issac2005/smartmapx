function addLayer(map, feature, plotId) {
  if (feature.geometry.type === 'Polygon') {
    const fill_layer = {
      'id': feature.properties['f_system_id'],
      'type': 'fill',
      'source': plotId,
      'filter': [
        'all',
        ['==', 'f_system_id', feature.properties['f_system_id']]
      ],
      'layout': {
        'visibility': feature.properties.content.status === 1 ? 'visible' : 'none'
      },
      'paint': {
        'fill-color': feature.properties.style['fill-color'],
        'fill-opacity': feature.properties.style['fill-opacity']
      }
    };
    if (feature.properties.style['fill-pattern']) {
      fill_layer.paint['fill-pattern'] = feature.properties.style['fill-pattern'];
    }
    map.addLayer(fill_layer);
    map.addLayer({
      'id': feature.properties['f_system_id'] + '_copy',
      'type': 'line',
      'source': plotId,
      'filter': [
        'all',
        ['==', 'f_system_id', feature.properties['f_system_id']]
      ],
      'layout': {
        'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': feature.properties.style['fill-outline-color'],
        'line-width': feature.properties.style['fill-outline-width'],
        'line-opacity': 1
      }
    });
  }
  if (feature.geometry.type === 'LineString') {
    const line_layer = {
      'id': feature.properties['f_system_id'],
      'type': 'line',
      'source': plotId,
      'filter': [
        'all',
        ['==', 'f_system_id', feature.properties['f_system_id']]
      ],
      'layout': {
        'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': feature.properties.style['line-color'],
        'line-width': feature.properties.style['line-width'],
        'line-opacity': feature.properties.style['line-opacity']
      }
    };
    if (feature.properties.style['line-dasharray'] === 1) {
      line_layer.paint['line-dasharray'] = [2, 2];
    } else {
      line_layer.paint['line-dasharray'] = [1, 0];
    }
    map.addLayer(line_layer);
  }
  if (feature.properties.mode_type === 'draw_point') {
    map.addLayer({
      'id': feature.properties['f_system_id'],
      'source': plotId,
      'type': 'circle',
      'filter': [
        'all',
        ['==', 'f_system_id', feature.properties['f_system_id']]
      ],
      'layout': {
        'visibility': feature.properties.content.status === 1 ? 'visible' : 'none'
      },
      'paint': {
        'circle-radius': feature.properties.style['circle-radius'],
        'circle-opacity': feature.properties.style['circle-opacity'],
        'circle-color': feature.properties.style['circle-color'],
        'circle-stroke-color': feature.properties.style['circle-stroke-color'],
        'circle-stroke-width': feature.properties.style['circle-stroke-width'],
        'circle-stroke-opacity': feature.properties.style['circle-opacity']
      }
    });
  }
  if (feature.properties.mode_type === 'draw_photo') {
    map.addSource(feature.properties.content.image_source, {
      'type': 'image',
      'url': feature.properties.content.image_url,
      'coordinates': feature.properties.content.image_coordinates
    });
    map.addLayer({
      'id': feature.properties.content.image_source,
      'type': 'raster',
      'source': feature.properties.content.image_source,
      'minzoom': 2,
      'maxzoom': 22,
    });
  }
  if (feature.properties.mode_type === 'draw_symbol') {
    map.addLayer({
      'id': feature.properties['f_system_id'],
      'source': plotId,
      'type': 'symbol',
      'filter': [
        'all',
        ['==', 'f_system_id', feature.properties['f_system_id']]
      ],
      'layout': {
        'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
        'icon-image': feature.properties.style['icon-image'],
        'icon-size': feature.properties.style['icon-size'],
        'text-field': '{none}',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      },
      'paint': {
        'icon-opacity': feature.properties.style['icon-opacity']
      }
    });
  }
  if (feature.properties.mode_type === 'draw_words') {
    map.addLayer({
      'id': feature.properties['f_system_id'],
      'source': plotId,
      'type': 'symbol',
      'filter': [
        'all',
        ['==', 'f_system_id', feature.properties['f_system_id']]
      ],
      'layout': {
        'visibility': feature.properties.content.status === 1 ? 'visible' : 'none',
        'text-field': '{desc}',
        'text-font': ['Microsoft YaHei Regular'],
        'text-size': feature.properties.style['text-size'],
        'text-offset': [0, -0.5],
        'text-max-width': feature.properties.style['text-max-width'],
        'text-line-height': feature.properties.style['text-line-height'],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      },
      'paint': {
        'text-color': feature.properties.style['text-color'],
        'text-halo-color': 'rgba(255, 255, 255, 1)',
        'text-halo-width': feature.properties.style['text-halo-width'],
        'text-halo-blur': 0
      }
    });
  }
  if (feature.properties.mode_type === 'draw_pendant_words') {

    const point = feature.properties.content.position;
    const marker = new smartmapx.UnionMarker(point, {
      watermark: true
    });
    marker.addTo(map);
    marker.setHTML('<div>' + feature.properties.desc + '</div>');
    marker.setStyle(feature.properties.style);
    marker.setProperty(feature);
    marker.setIndex(feature.properties.content.zIndex);
    marker.setReferencePoint(feature.properties.content.reference);
  }
  if (feature.properties.mode_type === 'draw_pendant_image') {
    const point = feature.properties.content.position;
    const marker = new smartmapx.UnionMarker(point, {
      watermark: true
    });
    marker.addTo(map);
    marker.setStyle(feature.properties.style);
    marker.setProperty(feature);
    marker.setIndex(feature.properties.content.zIndex);
    marker.setReferencePoint(feature.properties.content.reference);
  }
}
