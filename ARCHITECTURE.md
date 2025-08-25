# Units & Measurements Mock Test - Architecture Overview

This document provides an architectural overview of the RRB Mock Test application for Units & Measurements, built with vanilla JavaScript, HTML, and CSS.

## System Architecture

```mermaid
graph TB
    %% User Interface Layer
    subgraph "User Interface Layer"
        HTML[index.html<br/>Entry Point]
        COMP[Components/<br/>HTML Templates]
        CSS[CSS Stylesheets<br/>style.css, review-answers.css]
    end

    %% Application Layer
    subgraph "Application Layer"
        APP[app.js<br/>Main Application Controller]
        VM[ViewManager<br/>View State & Navigation]
        TM[TestManager<br/>Test Logic & Flow]
        QM[QuestionManager<br/>Question Handling]
    end

    %% State Management Layer
    subgraph "State Management Layer"
        SM[StateManager<br/>Application State]
        LS[LocalStorage<br/>Persistence]
    end

    %% Utility Layer
    subgraph "Utility Layer"
        UTILS[Utils<br/>Helper Functions]
        TIMER[CustomTimer<br/>Timer Component]
        QD[questions-data.js<br/>Question Bank]
    end

    %% Component Layer
    subgraph "View Components"
        LANDING[Landing View<br/>Test Setup]
        TEST[Test View<br/>Question Display]
        RESULT[Result View<br/>Score Analysis]
        REVIEW[Review View<br/>Answer Review]
        PANEL[Review Panel<br/>Modal Component]
    end

    %% Data Flow
    HTML --> APP
    APP --> VM
    APP --> TM
    APP --> QM
    APP --> SM
    
    VM --> COMP
    VM --> LANDING
    VM --> TEST
    VM --> RESULT
    VM --> REVIEW
    
    TM --> TIMER
    TM --> QD
    QM --> QD
    
    SM --> LS
    
    UTILS --> APP
    TIMER --> TEST
    PANEL --> TEST

    %% Styling
    CSS --> HTML
    CSS --> COMP

    %% State Flow
    SM -.-> VM
    SM -.-> TM
    SM -.-> QM
```

## Component Architecture

```mermaid
graph LR
    subgraph "Core Components"
        A[MockTestApp<br/>Main Controller]
        B[ViewManager<br/>UI State Management]
        C[TestManager<br/>Test Logic]
        D[QuestionManager<br/>Question Handling]
        E[StateManager<br/>Data Persistence]
    end

    subgraph "UI Components"
        F[Landing View<br/>Test Configuration]
        G[Test View<br/>Question Interface]
        H[Result View<br/>Performance Analysis]
        I[Review View<br/>Answer Review]
        J[Review Panel<br/>Quick Navigation]
    end

    subgraph "Utilities"
        K[CustomTimer<br/>Time Management]
        L[Utils<br/>Helper Functions]
        M[Question Bank<br/>Data Source]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    B --> F
    B --> G
    B --> H
    B --> I
    G --> J
    C --> K
    C --> M
    D --> M
    E --> LocalStorage[(LocalStorage)]
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant App as MockTestApp
    participant VM as ViewManager
    participant TM as TestManager
    participant SM as StateManager
    participant Timer as CustomTimer

    User->>App: Start Application
    App->>SM: Initialize State
    App->>VM: Load Components
    VM->>User: Show Landing View

    User->>App: Start Test
    App->>TM: Initialize Test
    TM->>Timer: Start Timer
    TM->>SM: Save Test Start
    VM->>User: Show Test View

    User->>App: Answer Question
    App->>SM: Save Answer
    App->>VM: Update UI

    User->>App: Navigate Questions
    App->>SM: Update Current Question
    App->>VM: Render Question

    Timer->>TM: Time Warning
    TM->>VM: Show Warning

    User->>App: Submit Test
    App->>TM: Calculate Results
    TM->>SM: Save Results
    VM->>User: Show Results View

    User->>App: Review Answers
    VM->>User: Show Review View
```

## Module Dependencies

```mermaid
graph TD
    subgraph "Loading Order"
        QD[questions-data.js] --> UTILS[utils.js]
        UTILS --> TIMER[timer.js]
        TIMER --> QM[question-manager.js]
        QM --> SM[state-manager.js]
        SM --> VM[view-manager.js]
        VM --> TM[test-manager.js]
        TM --> MAIN[app-main.js]
    end

    subgraph "Runtime Dependencies"
        MAIN -.-> QD
        MAIN -.-> UTILS
        MAIN -.-> TIMER
        VM -.-> HTML[HTML Components]
        SM -.-> LS[LocalStorage API]
        TIMER -.-> AUDIO[Web Audio API]
    end
```

## Key Features & Capabilities

### 1. **Modular Architecture**
- Component-based design with clear separation of concerns
- Lazy loading of HTML components
- Dependency injection pattern

### 2. **State Management**
- Centralized state management with StateManager
- Persistent storage using LocalStorage
- State validation and recovery mechanisms

### 3. **Test Management**
- Comprehensive timer system with audio/visual alerts
- Question navigation and bookmarking
- Real-time answer tracking and validation

### 4. **User Interface**
- Responsive design with CSS custom properties
- Dark mode support
- Modal components for enhanced UX

### 5. **Performance Analytics**
- Topic-wise accuracy analysis
- Difficulty-based performance metrics
- Detailed question-wise breakdown

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties
- **Storage**: LocalStorage API
- **Audio**: Web Audio API
- **Charts**: Canvas-based rendering
- **Architecture**: Component-based modular design

## File Structure Overview

```
├── index.html              # Entry point
├── css/
│   ├── style.css          # Main styles
│   └── review-answers.css # Review component styles
├── js/
│   ├── app.js             # Main application
│   ├── view-manager.js    # View management
│   ├── test-manager.js    # Test logic
│   ├── question-manager.js # Question handling
│   ├── state-manager.js   # State management
│   ├── timer.js           # Timer component
│   ├── utils.js           # Utility functions
│   └── questions-data.js  # Question bank
└── components/
    ├── landing-view.html
    ├── test-view.html
    ├── result-view.html
    ├── review-answers-view.html
    └── review-panel.html
```

This architecture ensures scalability, maintainability, and optimal performance for the RRB Mock Test application focused on Units & Measurements.