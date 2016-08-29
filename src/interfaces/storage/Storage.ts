export interface Storage {
    get( key: string ): any
    save( key: string, value: Object ): void
    remove( key: string ): void
    defined( key: string ): boolean
    define( key: string, value: Object ): void
}
