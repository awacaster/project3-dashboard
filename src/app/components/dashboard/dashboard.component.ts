import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import * as Papa from 'papaparse';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  searchTerm: string = '';
  charts: { [key: string]: Chart } = {};
  rawData: { [key: string]: any[] } = {};
  filteredData: { [key: string]: any[] } = {};

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    console.log('DashboardComponent: ngAfterViewInit called');
    this.loadAllData();
  }

  private loadAllData() {
    this.loadChart1();
    this.loadChart2();
    this.loadChart3();
    this.loadChart4();
    this.loadChart5();
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredData = { ...this.rawData };
    } else {
      Object.keys(this.rawData).forEach(key => {
        this.filteredData[key] = this.rawData[key].filter(item => 
          Object.values(item).some(value => 
            String(value).toLowerCase().includes(text.toLowerCase())
          )
        );
      });
    }
    this.updateAllCharts();
  }

  private updateAllCharts() {
    Object.keys(this.charts).forEach(chartId => {
      const chart = this.charts[chartId];
      const data = this.filteredData[chartId];
      
      if (data) {
        switch(chartId) {
          case 'chart1':
            this.updateRegionChart(data);
            break;
          case 'chart2':
            this.updateSectorChart(data);
            break;
          case 'chart3':
            this.updatePipelineChart(data);
            break;
          case 'chart4':
            this.updateGameSalesChart(data);
            break;
          case 'chart5':
            this.updateProductPriceChart(data);
            break;
        }
      }
    });
  }

  private updateRegionChart(data: any[]) {
    const regionCounts: { [key: string]: number } = {};
    data.forEach((row: any) => {
      const region = row.regional_office?.trim();
      if (region) {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    });
    
    const chart = this.charts['chart1'];
    if (chart) {
      chart.data.labels = Object.keys(regionCounts);
      chart.data.datasets[0].data = Object.values(regionCounts);
      chart.update();
    }
  }

  private updateSectorChart(data: any[]) {
    const sectorCounts: { [key: string]: number } = {};
    data.forEach((row: any) => {
      const sector = row.sector?.trim();
      if (sector) {
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      }
    });
    
    const chart = this.charts['chart2'];
    if (chart) {
      chart.data.labels = Object.keys(sectorCounts);
      chart.data.datasets[0].data = Object.values(sectorCounts);
      chart.update();
    }
  }

  private updatePipelineChart(data: any[]) {
    const stageTotals: { [key: string]: number } = {};
    data.forEach((row: any) => {
      const stage = row.deal_stage?.trim();
      const value = parseFloat(row.close_value);
      if (stage && !isNaN(value)) {
        stageTotals[stage] = (stageTotals[stage] || 0) + value;
      }
    });
    
    const chart = this.charts['chart3'];
    if (chart) {
      chart.data.labels = Object.keys(stageTotals);
      chart.data.datasets[0].data = Object.values(stageTotals);
      chart.update();
    }
  }

  private updateGameSalesChart(data: any[]) {
    const platformSales: { [key: string]: number } = {};
    data.forEach((row: any) => {
      const platform = row.Platform?.trim();
      const sales = parseFloat(row.Global_Sales);
      if (platform && !isNaN(sales)) {
        platformSales[platform] = (platformSales[platform] || 0) + sales;
      }
    });
    
    const sorted = Object.entries(platformSales)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5);
    
    const chart = this.charts['chart4'];
    if (chart) {
      chart.data.labels = sorted.map(([p]) => p);
      chart.data.datasets[0].data = sorted.map(([, s]) => s);
      chart.update();
    }
  }

  private updateProductPriceChart(data: any[]) {
    const priceMap: { [key: string]: number[] } = {};
    data.forEach((row: any) => {
      const series = row.series?.trim();
      const price = parseFloat(row.sales_price);
      if (series && !isNaN(price)) {
        if (!priceMap[series]) priceMap[series] = [];
        priceMap[series].push(price);
      }
    });
    
    const avgPrices: { [key: string]: number } = {};
    for (const [series, prices] of Object.entries(priceMap)) {
      avgPrices[series] = prices.reduce((a, b) => a + b, 0) / prices.length;
    }
    
    const chart = this.charts['chart5'];
    if (chart) {
      chart.data.labels = Object.keys(avgPrices);
      chart.data.datasets[0].data = Object.values(avgPrices);
      chart.update();
    }
  }

  private loadChart1() {
    console.log('DashboardComponent: loadChart1 called');
    Papa.parse('assets/data/sales_teams.csv', {
      download: true,
      header: true,
      complete: (results) => {
        this.rawData['chart1'] = results.data;
        this.filteredData['chart1'] = [...results.data];
        const regionCounts: { [key: string]: number } = {};

        results.data.forEach((row: any) => {
          const region = row.regional_office?.trim();
          if (region) {
            regionCounts[region] = (regionCounts[region] || 0) + 1;
          }
        });

        const ctx = document.getElementById('chart1') as HTMLCanvasElement;
        if (ctx) {
          this.charts['chart1'] = new Chart(ctx.getContext('2d')!, {
            type: 'doughnut',
            data: {
              labels: Object.keys(regionCounts),
              datasets: [{
                data: Object.values(regionCounts) as number[],
                backgroundColor: ['#4e79a7', '#f28e2c', '#e15759']
              }]
            }
          });
        }
      }
    });
  }

  private loadChart2() {
    console.log('DashboardComponent: loadChart2 called');
    Papa.parse('assets/data/accounts.csv', {
      download: true,
      header: true,
      complete: (results) => {
        this.rawData['chart2'] = results.data;
        this.filteredData['chart2'] = [...results.data];
        const sectorCounts: { [key: string]: number } = {};

        results.data.forEach((row: any) => {
          const sector = row.sector?.trim();
          if (sector) {
            sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
          }
        });

        const ctx = document.getElementById('chart2') as HTMLCanvasElement;
        if (ctx) {
          this.charts['chart2'] = new Chart(ctx.getContext('2d')!, {
            type: 'pie',
            data: {
              labels: Object.keys(sectorCounts),
              datasets: [{
                data: Object.values(sectorCounts) as number[],
                backgroundColor: ['#76b7b2', '#59a14f', '#edc949', '#af7aa1']
              }]
            }
          });
        }
      }
    });
  }

  private loadChart3() {
    console.log('DashboardComponent: loadChart3 called');
    Papa.parse('assets/data/sales_pipeline.csv', {
      download: true,
      header: true,
      complete: (results) => {
        this.rawData['chart3'] = results.data;
        this.filteredData['chart3'] = [...results.data];
        const stageTotals: { [key: string]: number } = {};

        results.data.forEach((row: any) => {
          const stage = row.deal_stage?.trim();
          const value = parseFloat(row.close_value);
          if (stage && !isNaN(value)) {
            stageTotals[stage] = (stageTotals[stage] || 0) + value;
          }
        });

        const ctx = document.getElementById('chart3') as HTMLCanvasElement;
        if (ctx) {
          this.charts['chart3'] = new Chart(ctx.getContext('2d')!, {
            type: 'bar',
            data: {
              labels: Object.keys(stageTotals),
              datasets: [{
                label: 'Close Value',
                data: Object.values(stageTotals) as number[],
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
      }
    });
  }

  private loadChart4() {
    console.log('DashboardComponent: loadChart4 called');
    Papa.parse('assets/data/video_game_sales.csv', {
      download: true,
      header: true,
      complete: (results) => {
        this.rawData['chart4'] = results.data;
        this.filteredData['chart4'] = [...results.data];
        const platformSales: { [key: string]: number } = {};

        results.data.forEach((row: any) => {
          const platform = row.Platform?.trim();
          const sales = parseFloat(row.Global_Sales);
          if (platform && !isNaN(sales)) {
            platformSales[platform] = (platformSales[platform] || 0) + sales;
          }
        });

        const sorted = Object.entries(platformSales)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 5);

        const ctx = document.getElementById('chart4') as HTMLCanvasElement;
        if (ctx) {
          this.charts['chart4'] = new Chart(ctx.getContext('2d')!, {
            type: 'line',
            data: {
              labels: sorted.map(([p]) => p),
              datasets: [{
                label: 'Global Sales (M)',
                data: sorted.map(([, s]) => s) as number[],
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
      }
    });
  }

  private loadChart5() {
    console.log('DashboardComponent: loadChart5 called');
    Papa.parse('assets/data/products.csv', {
      download: true,
      header: true,
      complete: (results) => {
        this.rawData['chart5'] = results.data;
        this.filteredData['chart5'] = [...results.data];
        const priceMap: { [key: string]: number[] } = {};

        results.data.forEach((row: any) => {
          const series = row.series?.trim();
          const price = parseFloat(row.sales_price);
          if (series && !isNaN(price)) {
            if (!priceMap[series]) priceMap[series] = [];
            priceMap[series].push(price);
          }
        });

        const avgPrices: { [key: string]: number } = {};
        for (const [series, prices] of Object.entries(priceMap)) {
          avgPrices[series] = prices.reduce((a, b) => a + b, 0) / prices.length;
        }

        const ctx = document.getElementById('chart5') as HTMLCanvasElement;
        if (ctx) {
          this.charts['chart5'] = new Chart(ctx.getContext('2d')!, {
            type: 'bar',
            data: {
              labels: Object.keys(avgPrices),
              datasets: [{
                label: 'Average Price ($)',
                data: Object.values(avgPrices) as number[],
                backgroundColor: ['#f28e2c']
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
      }
    });
  }
}
