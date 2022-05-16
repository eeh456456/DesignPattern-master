// m1.js
class Memento {
    constructor(content) {
        this.content = content
    }
    getContent () {
        return this.content
    }
}

class CareTaker {
    constructor() {
        this.list = []
    }

    save (memento) {
        this.list.push(memento)
    }

    restore (index) {
        return this.list[index] || void 0
    }
}

class Editor {
    constructor() {
        this.content = ''
        this.careTaker = new CareTaker()
    }

    setContent (content) {
        this.content = content
    }

    getContent () {
        return this.content
    }

    save () {
        this.careTaker.save(new Memento(this.content))
    }

    restore (index) {
        const memento = this.careTaker.restore(index)
        return memento && memento.getContent()
    }
}

export default Editor
