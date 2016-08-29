import { Ipix } from './ipix'

export class Question {
    id: string
    data: {
        wording: string
        ipixs: Ipix[]
    }
}
