export class Utils {

    public static deepCopy<T>(item: T): T {
        return JSON.parse(JSON.stringify(item));
    }
}
