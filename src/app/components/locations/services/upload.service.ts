import { BehaviorSubject, from, Observable, Observer, of } from "rxjs";
import { catchError, concatMap, take } from "rxjs/operators";

export class UploadService {

    public uploadFile$ = new BehaviorSubject<any>(null);

    public uploadFiles(event): void {

        const files = event?.target?.files;
        const numberOfFiles = files.length;
        from(files)
            .pipe(
                concatMap((file: File) => this._validateFile(file).pipe(catchError((error: any) => of(error)))),
                take(numberOfFiles)
            )
            .subscribe((validatedFile: any) => {
                this.uploadFile$.next(validatedFile);
            });
    }

    private _validateFile(file: File): Observable<any> {
        const fileReader = new FileReader();
        const { type, name } = file;
        return new Observable((observer: Observer<any>) => {
            this._validateSize(file, observer);
            fileReader.readAsText(file)
            fileReader.onload = event => {
                if (this._isJson(type)) {
                    const fileJson = JSON.parse(fileReader.result as string);
                    observer.next(fileJson);
                    observer.complete();
                }
            };
            fileReader.onerror = () => {
                observer.error({ error: { name, errorMessage: 'INVALID_FILE' } });
            };
        });
    }

    private _isJson(mimeType: string): boolean {
        return mimeType.match(/json\/*/) !== null;
    }

    private _validateSize(file: File, observer: Observer<any>): void {
        const { name, size } = file;
        if (!this._isValidSize(size)) {
            observer.error({ error: { name, errorMessage: 'INVALID_SIZE' } });
        }
    }

    private _isValidSize(size: number): boolean {
        const toKByte = size / 1024;
        return toKByte >= 5 && toKByte <= 5120;
    }

}