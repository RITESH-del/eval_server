class Send {
    static success(res, data, message = "success") {
        res.status(200).json({
            ok: true,
            message,
            data,
        });
    }

    static error(res, data, message = "error") {
        res.status(500).json({
            ok: false,
            message,
            data,
        });
    }

    static notFound(res, data, message = "not found") {
        res.status(404).json({
            ok: false,
            message,
            data,
        });
    }

    static unauthorized(res, data, message = "unauthorized") {
        res.status(401).json({
            ok: false,
            message,
            data,
        });
    }

    static validationErrors(res, errors) {
        res.status(422).json({
            ok: false,
            message: "Validation error",
            errors,
        });
    }

    static forbidden(res, data, message = "forbidden") {
        res.status(403).json({
            ok: false,
            message,
            data,
        });
    }

    static badRequest(res, data, message = "bad request") {
        res.status(400).json({
            ok: false,
            message,
            data,
        });
    }
}

export default Send;