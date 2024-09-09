// MapChart.js
import React, { useEffect, useRef ,useState} from 'react';
import * as echarts from 'echarts';
import 'echarts-extension-amap';
import AMapLoader from '@amap/amap-jsapi-loader';
import { setupAMap } from './MapUtils'; // 导入 AMap 配置函数
import { data, geoCoords, pieDimensions } from './mapData'; // 引入数据和配置
import cities from '../data/province.json';


const MapChart = () => {
  const chartRef = useRef(null);
  const [satelliteVisible, setSatelliteVisible] = useState(false); // 状态控制卫星图层的显示
  const amapRef = useRef(null); // 用于保存 AMap 实例
  const [selectedCity, setSelectedCity] = useState(cities[0]);  

  useEffect(() => {
    if (!chartRef.current) return; // Check if chartRef.current exists

    AMapLoader.load({
      key: '03526e76418d9af743a39c09e6083a52', // 替换为你的 AMap API 密钥
      version: '2.0',
      plugins: [
        "Map3D",
        "AMap.Scale",
        "AMap.ToolBar",
        "AMap.MouseTool",
        "AMap.PolyEditor",
        "AMap.PlaceSearch",
        "AMap.Autocomplete",
        "AMap.DistrictSearch",
        "AMap.MarkerClusterer",
      ],
    }).then(AMap => {
      const chart = echarts.init(chartRef.current);

      const pieSeries = [];

      echarts.util.each(data, (values, name) => {
        pieSeries.push({
          type: 'pie',
          name: name,
          coordinateSystem: 'amap',
          center: geoCoords[name],
          radius: 20,
          data: echarts.util.map(values, (value, idx) => ({
            name: pieDimensions[idx],
            value: value
          })),
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true
            },
            labelLine: {
              show: true,
              lineStyle: {
                color: '#fff'
              }
            }
          }
        });
      });

      const option = {
        amap: {
          viewMode: '3D',
          center: [102.278269, 35.391011],
          zoom: 8,
          resizeEnable: true,
          mapStyle: 'amap://styles/dark',
          renderOnMoving: true,
          echartsLayerZIndex: 2000,
          echartsLayerInteractive: true,
          largeMode: false
        },
        tooltip: {
          trigger: 'item'
        },
        animation: true,
        series: pieSeries
      };

      chart.setOption(option);

      setupAMap(chart, AMap); // 初始化 AMap 相关配置
      amapRef.current = chart.getModel().getComponent('amap')?.getAMap();
      return () => {
        chart.dispose();
      };
    }).catch(error => {
      console.error('Failed to load AMap:', error);
    });
  },[]);;

  const addSatelliteLayer = () => {
    amapRef.current?.add(new window.AMap.TileLayer.Satellite());
  };

  const removeSatelliteLayer = () => {
    amapRef.current?.getLayers().forEach(layer => {
      if (layer instanceof window.AMap.TileLayer.Satellite) {
        amapRef.current?.remove(layer);
      }
    });
  };
  useEffect(() => {
    // 更新卫星图层的可见性
    if (satelliteVisible) {
      addSatelliteLayer();
    } else {
      removeSatelliteLayer();
    }
  }, [satelliteVisible]);

  useEffect(() => {
    // 更新卫星图层的可见性
    if (satelliteVisible) {
      addSatelliteLayer();
    } else {
      removeSatelliteLayer();
    }
  }, [satelliteVisible]);

  useEffect(() => {
    if (amapRef.current && selectedCity) {
      amapRef.current.setCenter(selectedCity.center);
    }
  }, [selectedCity]); 

  const handleCityChange = (e) => {
    const adcode = e.target.value;
    const city = cities.find(city => city.adcode === adcode);
    if (city&& amapRef.current) {
      

      setSelectedCity(city);

        const polygons = amapRef.current.getAllOverlays();
        console.log(polygons);
        // 移除所有 Polygon
        polygons.forEach(polygon => {
          amapRef.current.remove(polygon);
        });

      
    }
  };
  
  return    (      
     
    <div >
                  <select onChange={handleCityChange} value={selectedCity.adcode}>
        {cities.map(city => (
          <option key={city.adcode} value={city.adcode}>
            {city.name}
          </option>
        ))}
      </select>
      <button className="toggleButton" onClick={() => setSatelliteVisible(!satelliteVisible)}>
  {satelliteVisible ? 'Hide Satellite Layer' : 'Show Satellite Layer'}
</button>
<div ref={chartRef} style={{ width: '100%', height: '100vh'}}></div>;      </div>
  )
};

export default MapChart;
