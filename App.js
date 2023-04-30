const url = require('url');

const express = require('express');
const app = express();

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const markers = [];



app.use(express.static(path.join(__dirname, 'public')));


function homeHTML() {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>Kakao 지도 시작하기</title>
      <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=58ade57e1d4d5f4677a833c1b7a69515&libraries=clusterer"></script>
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    </head>
    <body>
      <div id="map" style="width: 100%; height: 100vh;"></div>
      <script>
        const container = document.getElementById('map');
        const options = {
          center: new kakao.maps.LatLng(37.56255, 127.007),
          level: 3,
          tileSpiralEnabled: true,
          tileAnalasisForDisabled: false
        };
  
        const map = new kakao.maps.Map(container, options);
  
        kakao.maps.load(() => { // Kakao 지도 API 로드 완료 후 실행될 콜백 함수
          const clusterer = new kakao.maps.MarkerClusterer({
            map: map,
            averageCenter: true,
            gridSize: 80,
            minLevel: 5
          });
          let markers = [];
  
          function removeMarkers() {
            const curMarkers = clusterer.getMarkers(); // 현재 클러스터에 있는 마커들을 가져옴
            clusterer.removeMarkers(curMarkers); // 현재 클러스터에서 마커를 제거함
            markers = [];
          }
  
          function addMarkers() {
            removeMarkers();
            const bounds = map.getBounds();
            const filteredMarkers = markers.filter(function(position) {
              return bounds.contain(new kakao.maps.LatLng(position.latlng.lat, position.latlng.lng));
            });
            const markersToAdd = filteredMarkers.map(function(position) {
              const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(position.latlng.lat, position.latlng.lng),
              });
              const infowindow = new kakao.maps.InfoWindow({
                content: position.content,
              });
              kakao.maps.event.addListener(marker, 'mouseover', () => {
                infowindow.open(map, marker);
              });
              kakao.maps.event.addListener(marker, 'mouseout', () => {
                infowindow.close();
              });
              return marker;
            });
            clusterer.addMarkers(markersToAdd);
          }
  
          kakao.maps.event.addListener(map, 'dragend', function() {
            addMarkers();
          });
  
          kakao.maps.event.addListener(map, 'zoom_changed', function() {
            addMarkers();
          });
        });
      </script>
    </body>
  </html>`;
}

function upstore(){
  return``
}
function searchstore(){
  return``
}
function analysis(){
  return``
}
function guide(){
  return``
}
app.get('/',(req,res)=>{
  var _url = req.url;
  var queryData = url.parse(_url, true).query;
  console.log(queryData.id);

  var templete;
  if(_url ==='/'){
    templete=homeHTML();
    res.send(templete);
  }else if(_url==='/upstore'){
    templete=upstore();
    res.send(templete);
  }else if(_url==='/searchstore'){
    templete=searchstore();
    res.send(templete);
  }else if(_url==='/analysis'){
    templete=analysis();
    res.send(templete);
  }else if(_url==='/guide'){
    templete=guide();
    res.send(templete);
  }else{
    res.writeHead(404);
    res.end('Not found');
    return;
  }
});

const csvData = [];

fs.createReadStream('store24.csv')
  .pipe(csv())
  .on('data', (data) => {
    if (data.lat && data.lng) {
      csvData.push({
        content: `<div>${data.store}</div>`,
        latlng: { lat: parseFloat(data.lat), lng: parseFloat(data.lng) },
      });
    }
  })
  .on('end', async ()=>{
    markers.push(...csvData);
    await app.listen(3000);
    console.log('Server listening on port 3000');   
  });
