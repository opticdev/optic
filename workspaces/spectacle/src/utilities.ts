import { v4 as uuidv4 } from 'uuid';

export interface IdGenerator<T> {
  nextId(): Iterable<T>
}

export class UuidV4Generator implements IdGenerator<string> {
  * nextId() {
    yield uuidv4()
  }
};