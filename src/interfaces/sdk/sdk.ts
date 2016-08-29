export interface SDK {
    import(): Promise<any> | void
    init(): Promise<any> | void
    ready(): Promise<any>
}
