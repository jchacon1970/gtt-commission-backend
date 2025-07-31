export class User {
    constructor(
        id,
        name,
        email,
        password,
        id_rol,
        created_at,
        updated_at,
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.id_rol = id_rol;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // Método estático para crear instancia desde objeto JSON
    static fromJson(json) {
        return new User(
            json.id,
            json.name,
            json.email,
            json.password,
            json.id_rol,
            new Date(json.created_at),
            new Date(json.updated_at),
            Boolean(json.active),
        );
    }

    // Método para convertir a objeto plano
    toJson() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            password: this.password,
            id_rol: this.id_rol,
            created_at: this.created_at.toISOString(),
            updated_at: this.updated_at.toISOString(),
        };
    }
}