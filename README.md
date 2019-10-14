# Serialized Query

A Typescript class that captures any/all characteristics of a Firebase Query. This class can be fully serialized and deserialized.

## Example

```typescript
const query = new SerializedQuery('/user/profiles').orderByChild('age').limitToLast(2);
```
