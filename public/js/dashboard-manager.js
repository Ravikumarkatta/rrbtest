// Dashboard Manager Module
// Handles dashboard functionality, data visualization, and real-time updates

class DashboardManager {
  constructor() {
    this.api = new MockTestAPI();
    this.subjectChart = null;
    this.trendsChart = null;
    this.apiAvailable = true; // Track API availability
    this.currentFilters = {
      subject: '',
      chapter: '',
      startDate: '',
      endDate: ''
    };
    this.autoRefreshInterval = null;
  }

  // Initialize dashboard
  async init() {
    try {
      // Check if API is available first
      this.apiAvailable = await this.checkAPIAvailability();
      
      if (this.apiAvailable) {
        await this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
      } else {
        // Show offline dashboard with sample data
        this.showOfflineDashboard();
        this.setupEventListeners();
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      this.apiAvailable = false;
      this.showOfflineDashboard();
      this.setupEventListeners();
    }
  }

  // Check if API is available
  async checkAPIAvailability() {
    try {
      await this.api.request('/health');
      return true;
    } catch (error) {
      // More user-friendly error logging
      if (error.message.includes('API endpoint not found')) {
        console.warn('Dashboard API not configured. Running in offline mode.');
      } else if (error.message.includes('Failed to fetch')) {
        console.warn('Dashboard API server not running. Running in offline mode.');
      } else {
        console.warn('API not available, using offline mode:', error.message);
      }
      return false;
    }
  }

  // Show offline dashboard with sample data
  showOfflineDashboard() {
    // More informative status message
    const statusMessage = 'Dashboard is running in offline mode. Start the server or deploy to production to see live data.';
    this.showStatus(statusMessage, 'info');
    
    // Load sample data
    const sampleStats = {
      total_attempts: 0,
      average_percentage: 0,
      best_percentage: 0,
      unique_tests_taken: 0
    };
    
    this.updateStatisticsDisplay(sampleStats);
    this.updateSubjectTable([]);
    this.updateChapterTable([]);
    this.updateRecentResultsTable([]);
    this.updateSubjectChart([]);
    this.updateTrendsChart([]);
  }

  // Load all dashboard data
  async loadDashboardData() {
    await Promise.all([
      this.loadStatistics(),
      this.loadSubjectData(),
      this.loadChapterData(),
      this.loadRecentResults(),
      this.loadTrends(),
      this.populateFilterDropdowns()
    ]);
  }

  // Load dashboard statistics
  async loadStatistics() {
    try {
      const stats = await this.api.request('/dashboard?action=statistics');
      this.updateStatisticsDisplay(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      // Show default values instead of error
      this.updateStatisticsDisplay({
        total_attempts: 0,
        average_percentage: 0,
        best_percentage: 0,
        unique_tests_taken: 0
      });
    }
  }

  // Update statistics display
  updateStatisticsDisplay(stats) {
    document.getElementById('total-attempts').textContent = stats.total_attempts || '0';
    document.getElementById('average-score').textContent = 
      stats.average_percentage ? `${Math.round(stats.average_percentage)}%` : '0%';
    document.getElementById('best-score').textContent = 
      stats.best_percentage ? `${Math.round(stats.best_percentage)}%` : '0%';
    document.getElementById('unique-tests').textContent = stats.unique_tests_taken || '0';
  }

  // Load and display subject data
  async loadSubjectData() {
    try {
      const subjectData = await this.api.request('/dashboard?action=results-by-subject');
      this.updateSubjectTable(subjectData);
      this.updateSubjectChart(subjectData);
    } catch (error) {
      console.error('Failed to load subject data:', error);
      // Show empty data instead of error
      this.updateSubjectTable([]);
      this.updateSubjectChart([]);
    }
  }

  // Update subject results table
  updateSubjectTable(data) {
    const tbody = document.querySelector('#subject-results-table tbody');
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No data available</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.subject}</td>
        <td>${item.section_name || 'N/A'}</td>
        <td>${item.attempts}</td>
        <td class="${this.getScoreClass(item.average_percentage)}">${Math.round(item.average_percentage)}%</td>
        <td class="${this.getScoreClass(item.best_percentage)}">${Math.round(item.best_percentage)}%</td>
        <td class="${this.getScoreClass(item.lowest_percentage)}">${Math.round(item.lowest_percentage)}%</td>
      </tr>
    `).join('');
  }

  // Update subject chart
  updateSubjectChart(data) {
    const ctx = document.getElementById('subject-chart');
    if (!ctx) return;

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, skipping chart creation');
      return;
    }

    if (this.subjectChart) {
      this.subjectChart.destroy();
    }

    if (data.length === 0) {
      // Show placeholder for empty chart
      return;
    }

    const labels = data.map(item => item.subject);
    const averageScores = data.map(item => Math.round(item.average_percentage));
    const bestScores = data.map(item => Math.round(item.best_percentage));

    try {
      this.subjectChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Average Score',
              data: averageScores,
              backgroundColor: '#4CAF50',
              borderColor: '#45a049',
              borderWidth: 1
            },
            {
              label: 'Best Score',
              data: bestScores,
              backgroundColor: '#2196F3',
              borderColor: '#1976D2',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false // We use custom legend
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to create subject chart:', error);
    }
  }

  // Load and display chapter data
  async loadChapterData() {
    try {
      const chapterData = await this.api.request('/dashboard?action=results-by-chapter');
      this.updateChapterTable(chapterData);
    } catch (error) {
      console.error('Failed to load chapter data:', error);
      // Show empty data instead of error
      this.updateChapterTable([]);
    }
  }

  // Update chapter results table
  updateChapterTable(data) {
    const tbody = document.querySelector('#chapter-results-table tbody');
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No data available</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.subject}</td>
        <td>${item.chapter || 'N/A'}</td>
        <td>${item.section_name || 'N/A'}</td>
        <td>${item.attempts}</td>
        <td class="${this.getScoreClass(item.average_percentage)}">${Math.round(item.average_percentage)}%</td>
        <td class="${this.getScoreClass(item.best_percentage)}">${Math.round(item.best_percentage)}%</td>
        <td class="${this.getScoreClass(item.lowest_percentage)}">${Math.round(item.lowest_percentage)}%</td>
      </tr>
    `).join('');
  }

  // Load and display recent results
  async loadRecentResults() {
    try {
      const recentData = await this.api.request('/dashboard?action=recent-results&limit=20');
      this.updateRecentResultsTable(recentData);
    } catch (error) {
      console.error('Failed to load recent results:', error);
      // Show empty data instead of error
      this.updateRecentResultsTable([]);
    }
  }

  // Update recent results table
  updateRecentResultsTable(data) {
    const tbody = document.querySelector('#recent-results-table tbody');
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No recent results</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.file_name}</td>
        <td>${item.section_name || 'N/A'}</td>
        <td>${item.subject}</td>
        <td>${item.chapter || 'N/A'}</td>
        <td>${item.score}/${item.total}</td>
        <td class="${this.getScoreClass(item.percentage)}">${Math.round(item.percentage)}%</td>
        <td>${this.formatDate(item.date_taken)}</td>
      </tr>
    `).join('');
  }

  // Load and display performance trends
  async loadTrends() {
    try {
      const trendsData = await this.api.request('/dashboard?action=trends&days=30');
      this.updateTrendsChart(trendsData);
    } catch (error) {
      console.error('Failed to load trends:', error);
      // Show empty chart instead of error
      this.updateTrendsChart([]);
    }
  }

  // Update trends chart
  updateTrendsChart(data) {
    const ctx = document.getElementById('trends-chart');
    if (!ctx) return;

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded, skipping chart creation');
      return;
    }

    if (this.trendsChart) {
      this.trendsChart.destroy();
    }

    if (data.length === 0) {
      // Show placeholder for empty chart
      return;
    }

    const labels = data.map(item => this.formatDate(item.test_date));
    const scores = data.map(item => Math.round(item.average_percentage));

    try {
      this.trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Average Score',
            data: scores,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to create trends chart:', error);
    }
  }

  // Populate filter dropdowns
  async populateFilterDropdowns() {
    try {
      const [subjectData, chapterData] = await Promise.all([
        this.api.request('/dashboard?action=results-by-subject'),
        this.api.request('/dashboard?action=results-by-chapter')
      ]);

      // Populate subject dropdown
      const subjectFilter = document.getElementById('subject-filter-dashboard');
      if (subjectFilter) {
        const subjects = [...new Set(subjectData.map(item => item.subject))];
        subjectFilter.innerHTML = '<option value="">All Subjects</option>' +
          subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('');
      }

      // Populate chapter dropdown
      const chapterFilter = document.getElementById('chapter-filter-dashboard');
      if (chapterFilter) {
        const chapters = [...new Set(chapterData.map(item => item.chapter).filter(Boolean))];
        chapterFilter.innerHTML = '<option value="">All Chapters</option>' +
          chapters.map(chapter => `<option value="${chapter}">${chapter}</option>`).join('');
      }
    } catch (error) {
      console.error('Failed to populate filter dropdowns:', error);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Back to home button
    const backBtn = document.getElementById('back-to-home');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (window.app && window.app.viewManager) {
          window.app.viewManager.showView('landing');
        }
      });
    }

    // Filter controls
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => this.applyFilters());
    }

    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    }

    // Refresh recent results
    const refreshRecentBtn = document.getElementById('refresh-recent');
    if (refreshRecentBtn) {
      refreshRecentBtn.addEventListener('click', () => this.loadRecentResults());
    }

    // Export buttons
    const exportSubjectBtn = document.getElementById('export-subject-data');
    if (exportSubjectBtn) {
      exportSubjectBtn.addEventListener('click', () => this.exportSubjectData());
    }

    const exportChapterBtn = document.getElementById('export-chapter-data');
    if (exportChapterBtn) {
      exportChapterBtn.addEventListener('click', () => this.exportChapterData());
    }
  }

  // Apply filters
  async applyFilters() {
    // Check if API is available before trying to apply filters
    if (!this.apiAvailable) {
      this.showStatus('Filters not available in offline mode. Start the server to use filtering.', 'info');
      setTimeout(() => this.hideStatus(), 4000);
      return;
    }

    this.currentFilters = {
      subject: document.getElementById('subject-filter-dashboard')?.value || '',
      chapter: document.getElementById('chapter-filter-dashboard')?.value || '',
      startDate: document.getElementById('start-date-filter')?.value || '',
      endDate: document.getElementById('end-date-filter')?.value || ''
    };

    try {
      this.showStatus('Applying filters...', 'info');
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(this.currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const filteredResults = await this.api.request(`/dashboard?action=results&${params.toString()}`);
      this.updateRecentResultsTable(filteredResults);
      
      this.showStatus('Filters applied successfully', 'success');
      setTimeout(() => this.hideStatus(), 3000);
    } catch (error) {
      console.error('Failed to apply filters:', error);
      
      // More user-friendly error message
      if (error.message.includes('API endpoint not found')) {
        this.showError('Filtering requires the backend server. Please start the server to use this feature.');
      } else {
        this.showError('Failed to apply filters. Please try again.');
      }
    }
  }

  // Clear filters
  clearFilters() {
    document.getElementById('subject-filter-dashboard').value = '';
    document.getElementById('chapter-filter-dashboard').value = '';
    document.getElementById('start-date-filter').value = '';
    document.getElementById('end-date-filter').value = '';
    
    this.currentFilters = { subject: '', chapter: '', startDate: '', endDate: '' };
    this.loadRecentResults();
    this.showStatus('Filters cleared', 'success');
    setTimeout(() => this.hideStatus(), 2000);
  }

  // Export subject data
  async exportSubjectData() {
    if (!this.apiAvailable) {
      this.showStatus('Export not available in offline mode. Start the server to export data.', 'info');
      setTimeout(() => this.hideStatus(), 4000);
      return;
    }

    try {
      const data = await this.api.request('/dashboard?action=results-by-subject');
      const csvContent = this.convertToCSV(data, [
        'subject', 'section_name', 'attempts', 'average_percentage', 
        'best_percentage', 'lowest_percentage'
      ]);
      
      this.downloadCSV(csvContent, 'subject-results.csv');
      this.showStatus('Subject data exported successfully', 'success');
      setTimeout(() => this.hideStatus(), 3000);
    } catch (error) {
      console.error('Failed to export subject data:', error);
      this.showError('Failed to export subject data. Please ensure the server is running.');
    }
  }

  // Export chapter data
  async exportChapterData() {
    if (!this.apiAvailable) {
      this.showStatus('Export not available in offline mode. Start the server to export data.', 'info');
      setTimeout(() => this.hideStatus(), 4000);
      return;
    }

    try {
      const data = await this.api.request('/dashboard?action=results-by-chapter');
      const csvContent = this.convertToCSV(data, [
        'subject', 'chapter', 'section_name', 'attempts', 
        'average_percentage', 'best_percentage', 'lowest_percentage'
      ]);
      
      this.downloadCSV(csvContent, 'chapter-results.csv');
      this.showStatus('Chapter data exported successfully', 'success');
      setTimeout(() => this.hideStatus(), 3000);
    } catch (error) {
      console.error('Failed to export chapter data:', error);
      this.showError('Failed to export chapter data. Please ensure the server is running.');
    }
  }

  // Convert data to CSV
  convertToCSV(data, headers) {
    if (!data || data.length === 0) return '';
    
    const headerRow = headers.join(',');
    const dataRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : (value || '');
      }).join(',')
    );
    
    return [headerRow, ...dataRows].join('\n');
  }

  // Download CSV file
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Start auto-refresh for real-time updates
  startAutoRefresh() {
    // Only start auto-refresh if API is available
    if (this.apiAvailable === false) {
      return;
    }
    
    // Refresh every 5 minutes
    this.autoRefreshInterval = setInterval(() => {
      this.refreshDashboard();
    }, 5 * 60 * 1000);
  }

  // Stop auto-refresh
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  // Refresh dashboard data
  async refreshDashboard() {
    try {
      await this.loadDashboardData();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  }

  // Utility methods
  getScoreClass(percentage) {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    return 'score-needs-improvement';
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  showStatus(message, type = 'info') {
    const statusElement = document.getElementById('dashboard-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `status-message ${type}`;
      statusElement.classList.remove('hidden');
    }
  }

  showError(message) {
    this.showStatus(message, 'error');
    setTimeout(() => this.hideStatus(), 5000);
  }

  hideStatus() {
    const statusElement = document.getElementById('dashboard-status');
    if (statusElement) {
      statusElement.classList.add('hidden');
    }
  }

  // Cleanup method
  destroy() {
    this.stopAutoRefresh();
    if (this.subjectChart) this.subjectChart.destroy();
    if (this.trendsChart) this.trendsChart.destroy();
  }
}

// Global dashboard manager instance
window.dashboardManager = new DashboardManager();