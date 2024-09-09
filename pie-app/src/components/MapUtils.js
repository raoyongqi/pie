// MapUtils.js
export function setupAMap(chart, AMap) {
    const amapComponent = chart.getModel().getComponent('amap');
    const amap = amapComponent.getAMap();
  
    if (amap) {
      amap.addControl(new AMap.Scale());
      amap.addControl(new AMap.ToolBar());
      const districtSearch = new AMap.DistrictSearch({
        extensions: "all",
        subdistrict: 0,
      });
  
      districtSearch.search("河北省", function (status, result) {
        const outer = [
          new AMap.LngLat(-360, 90, true),
          new AMap.LngLat(-360, -90, true),
          new AMap.LngLat(360, -90, true),
          new AMap.LngLat(360, 90, true),
        ];
  
        const boundaries = result.districtList[0].boundaries;
        const pathArray = [outer];
  
        if (boundaries && Array.isArray(boundaries)) {
          boundaries.forEach(boundary => {
            if (Array.isArray(boundary)) {
              const hole = boundary.map(coord => {
                if (coord instanceof AMap.LngLat) {
                  return coord;
                } else {
                  console.warn('无效的坐标格式:', coord);
                  return null;
                }
              }).filter(latlng => latlng !== null);
  
              if (hole.length > 0) {
                pathArray.push(hole);
              }
            } else {
              console.warn('无效的边界:', boundary);
            }
          });
        } else {
          console.error('边界数据格式错误:', boundaries);
        }
  
        const polygon = new AMap.Polygon({
          path: pathArray,
          strokeColor: "#99ffff",
          strokeWeight: 4,
          strokeOpacity: 1,
          fillColor: "#fff",
          fillOpacity: 1,
        });
  
        amap.add(polygon);

        // amap.add(new AMap.TileLayer.Satellite());
      });
    }
  }
  