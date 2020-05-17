## Description

This sample demonstrates using graphql-to-sequelize library with NestJS.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Example query

```
{
  getUsers(
    limit: 3
    order: { id: Asc }
    where: { birthDate: { gt: "2020-05-17" }, name: { like: "%joe%" } }
  ) {
    rows {
      id
      firstName
      email
      birthDate
      comments(text: { like: "%test%" }) {
        text
      }
    }
    count
  }
}
```
