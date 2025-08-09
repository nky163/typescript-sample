// Buckpal Java annotations analogs (no-op decorators for documentation & potential future DI)

export function UseCase(): ClassDecorator {
  return () => { /* marker */ };
}

export function WebAdapter(): ClassDecorator {
  return () => { /* marker */ };
}

export function PersistenceAdapter(): ClassDecorator {
  return () => { /* marker */ };
}
