
const getLocationBtn = document.getElementById('getLocation');
const locationInput = document.getElementById('location');
const coordsDisplay = document.getElementById('coords');
const mapDiv = document.getElementById('map');

// 點擊按鈕後獲取地理位置
getLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("您的瀏覽器不支援定位功能");
    }
});

// 成功獲取座標時
function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // 顯示座標
    coordsDisplay.textContent = `緯度: ${latitude}, 經度: ${longitude}`;
    locationInput.value = `${latitude}, ${longitude}`;

    // 顯示 Google 地圖
    mapDiv.style.display = "block";
    const map = new google.maps.Map(mapDiv, {
        center: { lat: latitude, lng: longitude },
        zoom: 15
    });

    // 添加標記
    new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
    });

    // 取得縣市或完整地址並顯示
    getRegionFromCoordinates(latitude, longitude);
}

// 錯誤處理
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("用戶拒絕提供位置資訊");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("位置資訊不可用");
            break;
        case error.TIMEOUT:
            alert("請求位置超時");
            break;
        default:
            alert("無法獲取您的位置");
            break;
    }
}

// 使用 Geocoding API 獲取完整地址與經緯度
function getRegionFromCoordinates(lat, lng) {
    const geocoder = new google.maps.Geocoder();

    const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                // 獲取完整地址
                const address = results[0].formatted_address;
                // 顯示完整地址並加上經緯度
                locationInput.value = `${address} (${lat}, ${lng})`;
            }
        } else {
            alert("地理編碼失敗，請重試！");
        }
    });
}

    // 點擊按鈕時，將當前台灣時間設置到輸入框
    document.getElementById('setNow').addEventListener('click', () => {
      const datetimeInput = document.getElementById('datetime');
      const now = new Date();

      // 轉換當前時間為台灣時區時間 (Asia/Taipei)
      const localDateTime = new Date(now.toLocaleString('en-US', { 
          timeZone: 'Asia/Taipei',
          hour12: false
      }));

      // 格式化日期為 yyyy-MM-ddThh:mm
      const year = localDateTime.getFullYear();
      const month = String(localDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(localDateTime.getDate()).padStart(2, '0');
      const hours = String(localDateTime.getHours()).padStart(2, '0');
      const minutes = String(localDateTime.getMinutes()).padStart(2, '0');

      // 組合成符合 datetime-local 格式的字符串
      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

      // 設置當地時間到 datetime-local 輸入框
      datetimeInput.value = formattedDateTime;
  });
 

// 上傳相片
const fileInput = document.getElementById('fileInput');
const fileUpload = document.getElementById('fileUpload');
const previewContainer = document.getElementById('previewContainer');

// 當點擊檔案區域時，觸發文件選擇
fileUpload.addEventListener('click', function() {
    fileInput.click();
});

// 當選擇文件時顯示預覽
fileInput.addEventListener('change', function(event) {
    const files = event.target.files;
    
    // 限制最多五張圖片
    if (files.length > 5) {
        alert('最多只能選擇五張圖片');
        return; // 不繼續執行
    }

    previewContainer.innerHTML = ''; // 清空預覽區
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});



// 提交表單
document.getElementById("reportForm").addEventListener("submit", function(e) {
    e.preventDefault(); // 阻止表單默認提交

    // 隱藏表單
    document.getElementById("reportForm").style.display = "none";
    document.getElementById("notes").style.display = "none";
    document.getElementById("container1").style.display = "none";

    // 顯示感謝訊息
    document.getElementById("thankYouMessage").style.display = "block";

    // 你可以選擇進行頁面跳轉或者其他操作
    setTimeout(function() {
        window.location.href = "index.html";  // 跳轉頁面
    }, 20000);  // 5秒後跳轉
});

