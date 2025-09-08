// Frontend API Integration Example
// This shows how to integrate the frontend with the backend API

class MockTestAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Test Files API methods
  async addTestFile(fileName, fileJson) {
    return this.request('/test-files', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileJson })
    });
  }

  async listTestFiles(limit = 50, offset = 0) {
    return this.request(`/test-files?limit=${limit}&offset=${offset}`);
  }

  async fetchTestFile(id) {
    return this.request(`/test-files/${id}`);
  }

  async deleteTestFile(id) {
    return this.request(`/test-files/${id}`, {
      method: 'DELETE'
    });
  }

  async renameTestFile(id, fileName) {
    return this.request(`/test-files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fileName })
    });
  }

  // Test Results API methods
  async saveTestResult(fileId, subject, chapter, score, total, resultJson) {
    return this.request('/test-results', {
      method: 'POST',
      body: JSON.stringify({
        fileId, subject, chapter, score, total, resultJson
      })
    });
  }

  async getTestResults(fileId, limit = 50, offset = 0) {
    return this.request(`/test-files/${fileId}/results?limit=${limit}&offset=${offset}`);
  }

  // Dashboard API methods
  async getDashboardStatistics() {
    return this.request('/dashboard/statistics');
  }

  async getResultsBySubject() {
    return this.request('/dashboard/results-by-subject');
  }

  async getResultsByChapter() {
    return this.request('/dashboard/results-by-chapter');
  }

  async getRecentResults(limit = 20) {
    return this.request(`/dashboard/recent-results?limit=${limit}`);
  }

  async getFilteredResults(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return this.request(`/dashboard/results?${params.toString()}`);
  }

  async getPerformanceTrends(days = 30) {
    return this.request(`/dashboard/trends?days=${days}`);
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }
}

// Usage example for integration with existing app
class EnhancedMockTestApp {
  constructor() {
    this.api = new MockTestAPI();
    this.enhancedQuestionManager = new EnhancedQuestionManager();
  }

  // Enhanced file upload with backend storage
  async handleJSONUploadWithStorage(event) {
    const file = event.target.files[0];
    const statusElement = document.getElementById('json-status');
    
    if (!file) {
      if (statusElement) {
        statusElement.classList.add('hidden');
      }
      return;
    }

    try {
      // Load and validate using enhanced question manager
      const result = await this.enhancedQuestionManager.loadFromFile(file);
      
      if (result.success) {
        // Show local success
        statusElement.classList.remove('hidden', 'error');
        statusElement.classList.add('success');
        statusElement.innerHTML = `<div>✅ Successfully loaded ${result.count} questions from JSON file</div>`;
        
        // Save to backend database
        try {
          const savedFile = await this.api.addTestFile(file.name, {
            metadata: result.metadata,
            scoring_rules: result.scoringRules,
            grade_scale: result.gradeScale,
            questions: result.questions.map(q => ({
              id: q.originalId,
              text: q.question,
              type: q.type,
              options: q.options,
              correct_answer: q.correctAnswer,
              points: q.points,
              category: q.topic,
              difficulty: q.difficulty.toLowerCase(),
              time_limit: q.timeLimit,
              solution: q.solution,
              pyq_year: q.pyqYear
            }))
          });
          
          statusElement.innerHTML += `<div>💾 Saved to database with ID: ${savedFile.id}</div>`;
          
          // Update UI to use loaded questions
          this.loadQuestionsIntoApp(result.questions);
          
        } catch (dbError) {
          console.warn('Failed to save to database:', dbError);
          statusElement.innerHTML += `<div>⚠️ Loaded locally but failed to save to database: ${dbError.message}</div>`;
          
          // Still use the questions locally
          this.loadQuestionsIntoApp(result.questions);
        }
      }
    } catch (error) {
      statusElement.classList.remove('hidden', 'success');
      statusElement.classList.add('error');
      statusElement.innerHTML = `
        <div>❌ Failed to load JSON file:</div>
        <ul><li>${error.error || error.message}</li></ul>
      `;
    }
  }

  // Load test files from database
  async loadTestFilesFromDatabase() {
    try {
      const response = await this.api.listTestFiles();
      return response.files;
    } catch (error) {
      console.error('Failed to load test files from database:', error);
      return [];
    }
  }

  // Save test results to database
  async saveTestResultsToDatabase(fileId, testResults) {
    try {
      const subject = testResults.metadata?.subject || 'Unknown Subject';
      const chapter = testResults.metadata?.chapter || '';
      const score = testResults.score || 0;
      const total = testResults.total || 100;
      
      const resultJson = {
        answers: testResults.answers,
        timeSpent: testResults.timeSpent,
        bookmarked: testResults.bookmarked,
        performance: testResults.performance,
        metadata: testResults.metadata
      };

      const savedResult = await this.api.saveTestResult(
        fileId, subject, chapter, score, total, resultJson
      );
      
      console.log('Test results saved to database:', savedResult.id);
      return savedResult;
    } catch (error) {
      console.error('Failed to save test results:', error);
      throw error;
    }
  }

  // Create a test file browser UI
  createTestFileBrowser() {
    const browserHTML = `
      <div id="test-file-browser">
        <h3>Saved Test Files</h3>
        <div id="file-list">Loading...</div>
        <button id="refresh-files">Refresh</button>
      </div>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = browserHTML;
    
    // Add event listeners
    container.querySelector('#refresh-files').addEventListener('click', () => {
      this.refreshTestFileList();
    });
    
    return container;
  }

  // Refresh test file list
  async refreshTestFileList() {
    const fileList = document.getElementById('file-list');
    
    try {
      fileList.innerHTML = 'Loading...';
      const files = await this.loadTestFilesFromDatabase();
      
      if (files.length === 0) {
        fileList.innerHTML = '<p>No test files found.</p>';
        return;
      }
      
      fileList.innerHTML = files.map(file => `
        <div class="file-item">
          <h4>${file.file_name}</h4>
          <p>Subject: ${file.metadata.subject || 'Unknown'}</p>
          <p>Questions: ${file.question_count}</p>
          <p>Uploaded: ${new Date(file.uploaded_at).toLocaleDateString()}</p>
          <button onclick="loadTestFile('${file.id}')">Load</button>
          <button onclick="deleteTestFile('${file.id}')">Delete</button>
        </div>
      `).join('');
      
    } catch (error) {
      fileList.innerHTML = `<p>Error loading files: ${error.message}</p>`;
    }
  }

  // Load questions into the existing app
  loadQuestionsIntoApp(questions) {
    // This would integrate with your existing StateManager
    if (this.stateManager) {
      this.stateManager.setCustomQuestions(questions);
      this.stateManager.updateState({ questionSource: 'database' });
    }
    
    // Update UI
    if (this.viewManager) {
      this.viewManager.updateQuestionCount(this.stateManager.getState());
    }
  }
}

// Global functions for button clicks (if needed)
window.loadTestFile = async function(id) {
  try {
    const api = new MockTestAPI();
    const file = await api.fetchTestFile(id);
    
    // Parse and load questions
    const manager = new EnhancedQuestionManager();
    const questions = manager.parseQuestions(file.file_json);
    
    // Load into app (would need integration with existing app)
    console.log('Loaded test file:', file.file_name, 'with', questions.length, 'questions');
    
  } catch (error) {
    alert('Failed to load test file: ' + error.message);
  }
};

window.deleteTestFile = async function(id) {
  if (!confirm('Are you sure you want to delete this test file?')) {
    return;
  }
  
  try {
    const api = new MockTestAPI();
    await api.deleteTestFile(id);
    
    // Refresh the list
    const app = new EnhancedMockTestApp();
    app.refreshTestFileList();
    
  } catch (error) {
    alert('Failed to delete test file: ' + error.message);
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MockTestAPI, EnhancedMockTestApp };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MockTestAPI = MockTestAPI;
  window.EnhancedMockTestApp = EnhancedMockTestApp;
}