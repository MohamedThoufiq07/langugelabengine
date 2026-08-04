// Screen Renderer
import ScreenRenderer from "./ScreenRenderer";

class RendererRegistry {

    constructor() {

        this.renderers = new Map();

        // Every learning screen uses ScreenRenderer
        this.register("screen", ScreenRenderer);

    }

    register(type, renderer) {

        if (!type) {
            throw new Error("Renderer type is required.");
        }

        if (!renderer) {
            throw new Error(`Renderer "${type}" is invalid.`);
        }

        if (this.renderers.has(type)) {
            throw new Error(
                `Renderer "${type}" is already registered.`
            );
        }

        this.renderers.set(type, renderer);

    }

    getRenderer(type) {

        if (!this.renderers.has(type)) {

            const available =
                [...this.renderers.keys()].join(", ");

            throw new Error(

                `Renderer "${type}" is not registered.\n` +
                `Available renderers: ${available || "None"}`

            );

        }

        return this.renderers.get(type);

    }

    has(type) {

        return this.renderers.has(type);

    }

    unregister(type) {

        this.renderers.delete(type);

    }

    clear() {

        this.renderers.clear();

    }

    getRegisteredTypes() {

        return [...this.renderers.keys()];

    }

}

export default RendererRegistry;