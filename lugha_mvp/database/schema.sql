-- Lugha database schema (MySQL 8 / utf8mb4)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS game_rounds;
DROP TABLE IF EXISTS contribution_votes;
DROP TABLE IF EXISTS contributions;
DROP TABLE IF EXISTS translations;
DROP TABLE IF EXISTS user_languages;
DROP TABLE IF EXISTS user_badges;
DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS users;

CREATE TABLE countries (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(80) NOT NULL UNIQUE,
  iso_code     CHAR(2) NOT NULL UNIQUE,
  flag_emoji   VARCHAR(8) NOT NULL DEFAULT '',
  region       VARCHAR(40) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE languages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(80) NOT NULL UNIQUE,
  iso_code      VARCHAR(8) NOT NULL,
  family        VARCHAR(60) NOT NULL DEFAULT '',
  speakers      BIGINT NOT NULL DEFAULT 0,
  country_id    INT NULL,
  is_endangered TINYINT(1) NOT NULL DEFAULT 0,
  description   TEXT,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(80) NOT NULL,
  username        VARCHAR(40) NOT NULL UNIQUE,
  email           VARCHAR(160) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  country_id      INT NULL,
  avatar_initial  CHAR(1) NOT NULL DEFAULT 'A',
  points          INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_languages (
  user_id      INT NOT NULL,
  language_id  INT NOT NULL,
  role         ENUM('speaks','learning') NOT NULL,
  PRIMARY KEY (user_id, language_id, role),
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contributions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  language_id   INT NOT NULL,
  word          VARCHAR(160) NOT NULL,
  meaning       VARCHAR(255) NOT NULL,
  example       TEXT,
  part_of_speech VARCHAR(40) DEFAULT 'noun',
  content_type  VARCHAR(40) DEFAULT 'word',
  region        VARCHAR(80) DEFAULT '',
  audio_url     MEDIUMTEXT,
  upvotes       INT NOT NULL DEFAULT 0,
  flag_count    INT NOT NULL DEFAULT 0,
  voter_count   INT NOT NULL DEFAULT 0,
  confidence_score FLOAT NOT NULL DEFAULT 42,
  verification_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
  INDEX idx_lang (language_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contribution_votes (
  user_id        INT NOT NULL,
  contribution_id INT NOT NULL,
  vote           ENUM('confirm','differ') NOT NULL DEFAULT 'confirm',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, contribution_id),
  FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE game_rounds (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  game_type       VARCHAR(40) NOT NULL,
  contribution_id INT NULL,
  prompt_json     TEXT,
  response_json   TEXT,
  correct         TINYINT NULL,
  points_awarded  INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE translations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NULL,
  source_lang   VARCHAR(80) NOT NULL,
  target_lang   VARCHAR(80) NOT NULL,
  source_text   TEXT NOT NULL,
  translated    TEXT NOT NULL,
  provider      VARCHAR(40) NOT NULL DEFAULT 'mock',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE badges (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(40) NOT NULL UNIQUE,
  name         VARCHAR(80) NOT NULL,
  icon         VARCHAR(8) NOT NULL,
  description  VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_badges (
  user_id    INT NOT NULL,
  badge_id   INT NOT NULL,
  awarded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;
