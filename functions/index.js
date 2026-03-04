const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require("nodemailer");

// Definición de secretos para ocultar credenciales en GitHub
const gmailUser = defineSecret('GMAIL_USER');
const gmailPass = defineSecret('GMAIL_PASS');

// Configuración de barberos y local
const correosBarberos = {
    "Alejandro": "cumbo2311@gmail.com",
    "Marcos": "correo_marcos@gmail.com", // Reemplazar con real
    "Tomás": "correo_tomas@gmail.com"    // Reemplazar con real
};

const INFO_LOCAL = {
    nombre: "4299 BARBER",
    direccion: "Av. Mitre 4299 - Avellaneda",
    googleMaps: "https://www.google.com/maps/search/?api=1&query=Av.+Mitre+4299+Avellaneda"
};

exports.enviarMailNuevoTurno = onDocumentCreated({
    document: "turnos/{turnoId}",
    secrets: [gmailUser, gmailPass]
}, async (event) => {
    const data = event.data.data();
    const barberoNombre = data.barbero;
    const mailBarbero = correosBarberos[barberoNombre];
    const mailCliente = data.email;

    // Configuración del transporte seguro
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: gmailUser.value(),
            pass: gmailPass.value(), 
        },
    });

    // Mapeo de precios actualizados
    const precios = {
        'Corte Clásico': '$16.000',
        'Corte + Barba': '$18.000',
        'Color global': '$55.000',
        'Mechas': '$50.000+',
        'Iluminación': '$30.000'
    };
    const precioFinal = precios[data.servicio] || "A confirmar";

    // --- OPCIONES PARA EL BARBERO ---
    const mailOptionsBarbero = {
        from: `"${INFO_LOCAL.nombre}" <${gmailUser.value()}>`,
        to: mailBarbero,
        subject: `✂️ Nuevo Turno: ${data.nombre} ${data.apellido}`,
        html: `
            <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
                <h2 style="color: #333;">¡Hola ${barberoNombre}!</h2>
                <p>Tenés una nueva reserva en el sistema:</p>
                <ul style="background: white; padding: 20px; border-radius: 10px; list-style: none;">
                    <li><strong>Cliente:</strong> ${data.nombre} ${data.apellido}</li>
                    <li><strong>Servicio:</strong> ${data.servicio}</li>
                    <li><strong>Fecha:</strong> ${data.fecha}</li>
                    <li><strong>Hora:</strong> ${data.hora} hs</li>
                    <li><strong>WhatsApp:</strong> ${data.telefono}</li>
                </ul>
            </div>
        `,
    };

    // --- OPCIONES PARA EL CLIENTE ---
    const mailOptionsCliente = {
        from: `"${INFO_LOCAL.nombre}" <${gmailUser.value()}>`,
        to: mailCliente,
        subject: `✅ Turno Confirmado - ${INFO_LOCAL.nombre}`,
        html: `
            <div style="font-family: sans-serif; background-color: #050505; color: #ffffff; padding: 40px; text-align: center;">
                <h1 style="color: #eab308; font-style: italic; letter-spacing: -1px; margin-bottom: 30px;">${INFO_LOCAL.nombre}</h1>
                <div style="background-color: #18181b; border: 1px solid #27272a; padding: 30px; border-radius: 20px; text-align: left; max-width: 480px; margin: 0 auto; line-height: 1.6;">
                    <h2 style="color: #ffffff; margin-top: 0; font-size: 24px;">¡Hola ${data.nombre}!</h2>
                    <p style="color: #a1a1aa;">Tu reserva ha sido confirmada. Te esperamos para brindarte la mejor atención.</p>
                    
                    <div style="background-color: #0a0a0a; border-radius: 12px; padding: 20px; margin: 25px 0;">
                        <p style="margin: 5px 0;"><strong>📍 Dirección:</strong> ${INFO_LOCAL.direccion}</p>
                        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${data.fecha}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${data.hora} hs</p>
                        <p style="margin: 5px 0;"><strong>💇‍♂️ Servicio:</strong> ${data.servicio}</p>
                        <p style="margin: 5px 0;"><strong>💰 Precio:</strong> <span style="color: #eab308; font-weight: bold;">${precioFinal}</span></p>
                        <p style="margin: 5px 0;"><strong>✂️ Barbero:</strong> ${barberoNombre}</p>
                    </div>

                    <a href="${INFO_LOCAL.googleMaps}" style="display: block; background-color: #eab308; color: #000; text-decoration: none; padding: 15px; border-radius: 12px; text-align: center; font-weight: bold; margin-bottom: 20px;">
                        ¿CÓMO LLEGAR? (GOOGLE MAPS)
                    </a>

                    <p style="font-size: 11px; color: #71717a; text-align: center; margin-bottom: 0;">
                        Si necesitás cancelar, por favor avisanos vía WhatsApp.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        const promesas = [];
        if (mailBarbero) promesas.push(transporter.sendMail(mailOptionsBarbero));
        if (mailCliente) promesas.push(transporter.sendMail(mailOptionsCliente));

        await Promise.all(promesas);
        console.log("Notificaciones de turno enviadas con éxito");
    } catch (error) {
        console.error("Error crítico en el proceso de envío:", error);
    }
});