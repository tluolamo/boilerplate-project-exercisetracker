[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tluolamo_boilerplate-project-exercisetracker&metric=alert_status)](https://sonarcloud.io/dashboard?id=tluolamo_boilerplate-project-exercisetracker)
![CircleCI](https://img.shields.io/circleci/build/github/tluolamo/boilerplate-project-exercisetracker)
[![codecov](https://codecov.io/gh/tluolamo/boilerplate-project-exercisetracker/branch/gomix/graph/badge.svg)](https://codecov.io/gh/tluolamo/boilerplate-project-exercisetracker)
[![Dependency Status](https://david-dm.org/tluolamo/boilerplate-project-exercisetracker.svg)](https://david-dm.org/tluolamo/boilerplate-project-exercisetracker)
[![Dev Dependency Status](https://david-dm.org/tluolamo/boilerplate-project-exercisetracker/dev-status.svg)](https://david-dm.org/tluolamo/boilerplate-project-exercisetracker)

# Exercise Tracker REST API

#### A microservice project, part of Free Code Camp's curriculum

### User Stories

1. I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
2. I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
3. I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will be the user object with also with the exercise fields added.
4. I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).
5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
