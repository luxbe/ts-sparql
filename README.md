# TS SPARQL

TS SPARQL is an object to SPARQL mapper

## Connection

```js
const tsSparql = TsSparql.init(options);
```

### Options

| Property | Description |
| :------: | :---------: |

## Models

### Definition

```js
@Entity('user')
export class User {
    @Id()
    @Property()
    public id: string;
}
```

### Entity

Decorating a class with the `Entity` decorator.

## Storage

```json
{
    "keys": ["user"],
    "default": "",
    "prefixes": {
        "user": {}
    },
    "ids": {
        "user": "id"
    },
    "properties": {
        "user": [
            {
                "key": "key",
                "prefix": "aasdgasg",
                "literal": true
            }
        ]
    }
}
```
