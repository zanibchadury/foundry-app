CREATE DATABASE IF NOT EXISTS foundry;
USE foundry;

CREATE TABLE IF NOT EXISTS ideas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Product', 'Tool', 'Service', 'Community', 'Research') NOT NULL,
  author VARCHAR(100) DEFAULT 'Anonymous',
  status ENUM('New', 'In Review', 'Building', 'Shipped') NOT NULL DEFAULT 'New',
  votes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO ideas (title, description, category, author, status, votes) VALUES
('Offline-first field notes app', 'Sync notes automatically once signal returns, built for researchers and surveyors working off-grid.', 'Product', 'Amina R.', 'Building', 14),
('Shared component playground', 'A drop-in visual sandbox so teams can preview design-system components without spinning up the whole app.', 'Tool', 'Devan K.', 'In Review', 9),
('Neighbourhood tool library', 'Borrow power tools from neighbours instead of buying one-off equipment, coordinated through a lightweight booking app.', 'Community', 'Priya S.', 'New', 21),
('Freelancer invoice automator', 'Turns tracked hours into compliant invoices and chases late payments automatically.', 'Service', 'Omar F.', 'Shipped', 33),
('Plain-language research digest', 'Weekly summaries of new papers in a chosen field, written for practitioners rather than academics.', 'Research', 'Lin W.', 'New', 7);
