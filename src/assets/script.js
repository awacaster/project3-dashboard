// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  loadChart1();
  loadChart2();
  loadChart3();
  loadChart4();
  loadChart5();
});

// 🟢 Chart 1: Doughnut – Sales Agents by Region
function loadChart1() {
  Papa.parse('assets/data/sales_teams.csv', {
    download: true,
    header: true,
    complete: (results) => {
      const regionCounts = {};

      results.data.forEach(row => {
        const region = row.region?.trim();
        if (region) {
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        }
      });

      const ctx = document.getElementById('chart1').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(regionCounts),
          datasets: [{
            data: Object.values(regionCounts),
            backgroundColor: ['#4e79a7', '#f28e2c', '#e15759']
          }]
        }
      });
    }
  });
}

// 🟣 Chart 2: Pie – Account Distribution by Sector
function loadChart2() {
  Papa.parse('assets/data/accounts.csv', {
    download: true,
    header: true,
    complete: (results) => {
      const sectorCounts = {};

      results.data.forEach(row => {
        const sector = row.sector?.trim();
        if (sector) {
          sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        }
      });

      const ctx = document.getElementById('chart2').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(sectorCounts),
          datasets: [{
            data: Object.values(sectorCounts),
            backgroundColor: ['#76b7b2', '#59a14f', '#edc949', '#af7aa1']
          }]
        }
      });
    }
  });
}

// 🔵 Chart 3: Bar – Total Close Value by Deal Stage
function loadChart3() {
  Papa.parse('assets/data/sales_pipeline.csv', {
    download: true,
    header: true,
    complete: (results) => {
      const stageTotals = {};

      results.data.forEach(row => {
        const stage = row.deal_stage?.trim();
        const value = parseFloat(row.close_value);
        if (stage && !isNaN(value)) {
          stageTotals[stage] = (stageTotals[stage] || 0) + value;
        }
      });

      const ctx = document.getElementById('chart3').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(stageTotals),
          datasets: [{
            label: 'Close Value',
            data: Object.values(stageTotals),
            backgroundColor: '#4e79a7'
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  });
}

// 🔴 Chart 4: Line – Top 5 Gaming Platforms by Global Sales
function loadChart4() {
  Papa.parse('assets/data/video_game_sales.csv', {
    download: true,
    header: true,
    complete: (results) => {
      const platformSales = {};

      results.data.forEach(row => {
        const platform = row.Platform?.trim();
        const sales = parseFloat(row.Global_Sales);
        if (platform && !isNaN(sales)) {
          platformSales[platform] = (platformSales[platform] || 0) + sales;
        }
      });

      const sorted = Object.entries(platformSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const ctx = document.getElementById('chart4').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: sorted.map(([p]) => p),
          datasets: [{
            label: 'Global Sales (M)',
            data: sorted.map(([, s]) => s),
            borderColor: '#e15759',
            backgroundColor: 'rgba(225,87,89,0.3)',
            fill: true
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  });
}

// 🟠 Chart 5: Horizontal Bar – Avg Price by Product Series
function loadChart5() {
  Papa.parse('assets/data/products.csv', {
    download: true,
    header: true,
    complete: (results) => {
      const priceMap = {};

      results.data.forEach(row => {
        const series = row.product_series?.trim();
        const price = parseFloat(row.price);
        if (series && !isNaN(price)) {
          if (!priceMap[series]) priceMap[series] = [];
          priceMap[series].push(price);
        }
      });

      const avgPrices = {};
      for (const [series, prices] of Object.entries(priceMap)) {
        avgPrices[series] = prices.reduce((a, b) => a + b, 0) / prices.length;
      }

      const ctx = document.getElementById('chart5').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(avgPrices),
          datasets: [{
            label: 'Average Price ($)',
            data: Object.values(avgPrices),
            backgroundColor: '#f28e2c'
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: { beginAtZero: true }
          }
        }
      });
    }
  });
}
