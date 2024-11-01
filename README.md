﻿
# Happy Warehouse Inventory Management System

Happy Warehouse is an inventory management system designed for Happy Company to manage its products across multiple warehouses located in various countries and cities. This system efficiently tracks inventory levels, supports real-time updates from external sources, and provides administrative tools for warehouse management.

## Technologies Used

- **Backend**: ASP.NET Core 6 (C#)
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript, jQuery, Bootstrap
- **Logging**: Serilog
- **Authentication**: JWT

## Project Structure

```
HappyWarehouse/
├── DataAccessLayer/
│   ├── DBContext/           # Entity Framework context configuration
│   ├── DTOs/                # Data Transfer Objects for API communication
│   ├── Enums/               # Enum definitions for roles, statuses, etc.
│   ├── Migrations/          # Database migrations
│   ├── Models/              # Entity models
│
├── FrontEnd/
│   ├── css/                 # CSS files for styling
│   ├── js/                  # JavaScript files, jQuery functions
│   ├── Pages/               # HTML pages for different views
│   │   ├── Country/
│   │   ├── Item/
│   │   ├── Logs/
│   │   ├── Users/
│   │   └── Warehouse/
│
├── WebAPI/
│   ├── Controllers/         # API controllers
│   ├── logs/                # Log files (using Serilog)
│
└── packages/                # NuGet packages
```

## Setup and Installation
   **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/HappyWarehouse.git
   cd HappyWarehouse
   ```

   **Setups**:
   ```bash
   1- Open the solution.
   2- Run the WebAPI project and copy the application URL from browser. (e.g., https://localhost:7251/).
   3- In the Front-End project, open the js/main.js file.
   4- Update the baseURL variable to the WebAPI application URL copied in Step 2.
   5- In the Front-End project, open Login.html in the browser.
   6- Login to the system using this credentials:
   Email: admin@happywarehouse.com
   Password: P@ssw0rd
   ```
