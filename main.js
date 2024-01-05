const axios = require('axios');
const fs = require('fs');
const nodemailer = require("nodemailer");

const rutaArchivo = 'titulos.txt';

// Estructura de la data final
class Noticia {
    constructor(titulo, descripcion, fecha, pais, url) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.pais = pais;
        this.url = url
    }
}

(async () => {

    let newsData = [];

    // Primera API
    const url = 'http://api.mediastack.com/v1/news'

    const params = {
        access_key: 'key privada',
        keywords: 'Brahman',
        countries: 'ar, br, co, us, mx, au',
        limit: 2
    }

    // Se reliza el GET a la API 
    try {
        const res = await axios.get(url, {params});

        // La data recibida se estructura segun la clase Noticia
        const noti1 = res.data.data.map(noti => new Noticia(
            noti.title, noti.description, noti.published_at, noti.country, noti.url
        ))

        newsData.push(...noti1);
    } catch (err) {
        console.log(err)
    }
    
    // Segunda API
    const url2 = 'https://newsdata.io/api/1/news'

    const params1 = {
        apikey: 'key privada',
        q: 'Brahman',
        country: 'us,ar,au,mx,br',
        size: 2
    }

    // Se realiza el GET a la API
    try {
        const res2 = await axios.get(url2, { params: params1 });

        // La data recibida se estructura segun la clase Noticia
        const noti2 = res2.data.results.map(noti => new Noticia(
            noti.title, noti.description, noti.pubDate, noti.country[0], noti.link
        ))

        newsData.push(...noti2);
    } catch (err2) {
        console.log(err2)
    }

    // Se transforma el set en list
    const newsList = [...newsData]

    // Verifica que el archivo exista, caso contrario crea el archivo
    if (!fs.existsSync(rutaArchivo)) {
        fs.writeFileSync(rutaArchivo, '');
    }
    
    // Lee el archivo de texto
    const titulosExistentes = fs.readFileSync(rutaArchivo, 'utf-8').split('\n').map(titulo => titulo.trim());
    
    // Se filtra la data con el objetivo de evitar duplicaciones, se hace comparando titulos
    const dataFiltrada = newsList.filter(noti => {
        if (titulosExistentes.includes(noti.titulo)) {
            return false
        } else {
            fs.appendFileSync(rutaArchivo, `${noti.titulo}\n`)
            return true
        }
    });

    // Finalmente, si la data existe se manda al mail indicado a razon de 1 mail por noticia
    if(dataFiltrada) {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "mail",
                pass: "contraseña"
            },
        });
    
        dataFiltrada.forEach(noti => {
            const info = transporter.sendMail({
                from: 'mail ',
                to: 'mail receptor',
                subject: `NUEVA NOTICIA: ${noti.titulo}`,
                text: `Descripción: ${noti.descripcion} 
                \nFecha: ${noti.fecha}
                \nPaís: ${noti.pais}
                \nurl: ${noti.url}`
            });
        })
    
    }


})();


