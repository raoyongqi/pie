// MapChart.js
import React, { useEffect, useRef ,useState} from 'react';
import * as echarts from 'echarts';
import 'echarts-extension-amap';
import AMapLoader from '@amap/amap-jsapi-loader';
import { setupAMap } from './MapUtils'; // 导入 AMap 配置函数
import { capitals} from '../data/site2.js'; // 引入数据和配置
import cities from '../data/region_centers.json';
import './styles.css'; // 或使用 CSS 模块 import styles from './ButtonStyles.module.css';
import { createPieSeries } from './createPieSeries';

import { globalMaxPLValue, filteredCapitals} from './dataUtils'; // 导入外部函数

const MapChart = () => {
  const chartRef = useRef(null);
  const [satelliteVisible, setSatelliteVisible] = useState(false); // 状态控制卫星图层的显示
  const amapRef = useRef(null); // 用于保存 AMap 实例
  const [selectedCity, setSelectedCity] = useState(cities[0]);  
  const chartInstanceRef = useRef(null); // 用于保存 ECharts 实例


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

    
      const pieSeries = createPieSeries(filteredCapitals, globalMaxPLValue);

      const option = {
        amap: {
          viewMode: '3D',
          center: cities[0].center,
          zoom: 7,
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

      setupAMap(chart, AMap,cities[0]); // 初始化 AMap 相关配置
        amapRef.current = chart.getModel().getComponent('amap')?.getAMap();
      chartInstanceRef.current = chart;
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
    if (amapRef.current && selectedCity && chartInstanceRef.current) {

      const filteredCapitals = capitals.filter(capital => {
        // 检查是否匹配 province, city 或 district
        return capital.province ===selectedCity.name || 
               capital.city ===selectedCity.name || 
               capital.district ===selectedCity.name;
      });
      const currentOption = chartInstanceRef.current.getOption();
      
      const pieSeries = createPieSeries(filteredCapitals, globalMaxPLValue);
      const updatedOption = {
        ...currentOption,
        center: selectedCity.center,
        series: pieSeries // 仅更新数据系列
      };
      console.log(updatedOption)
      chartInstanceRef.current.setOption(updatedOption, true);

      setupAMap(chartInstanceRef.current, window.AMap,selectedCity); // 初始化 AMap 相关配置
      
      amapRef.current = chartInstanceRef.current.getModel().getComponent('amap')?.getAMap();
    }

  }, [selectedCity]); 

  const handleCityChange = (e) => {
    const adcode = e.target.value;
    const city = cities.find(city => city.adcode === adcode);
    if (city && amapRef.current && chartInstanceRef.current) {
      setSelectedCity(city);
    }
  };
  
  return (
    <div>
      <select className="custom-select" onChange={handleCityChange} value={selectedCity.adcode}>
        {cities.map(city => (
          <option key={city.adcode} value={city.adcode}>
            {city.name}
          </option>
        ))}
      </select>
      <button
        className={`toggleButton ${satelliteVisible ? 'button-red' : 'button-blue'}`}
        onClick={() => setSatelliteVisible(!satelliteVisible)}
      >
        {satelliteVisible ? 'Hide Satellite Layer' : 'Show Satellite Layer'}
      </button>
      <div ref={chartRef} style={{ width: '100%', height: '100vh' }}></div>
    </div>
  );
};
export default MapChart;
