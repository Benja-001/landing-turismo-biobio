/**
 * Codigo.gs
 * Script para recibir correos desde la Landing Page y guardarlos en Google Sheets.
 * 
 * INSTRUCCIONES:
 * 1. Pega este código en el editor de Apps Script de tu Google Sheet.
 * 2. Guarda el proyecto.
 * 3. Haz clic en "Implementar" > "Nueva implementación" > Selecciona "Aplicación web".
 * 4. Configura: "Ejecutar como: Yo" y "Quién tiene acceso: Cualquier persona".
 * 5. Copia la URL que te genera y pégala en tu archivo script.js.
 */

const SHEET_NAME = 'Leads';

function doPost(e) {
  // Configuración básica de CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(SHEET_NAME);
    
    // Si la hoja no existe, la creamos y colocamos los encabezados
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
      sheet.appendRow(['Fecha y Hora', 'Nombre', 'Apellido', 'Correo Electrónico']);
      // Dar un poco de estilo a los encabezados
      sheet.getRange("A1:D1").setFontWeight("bold").setBackground("#e2e8f0");
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(2, 150);
      sheet.setColumnWidth(3, 150);
      sheet.setColumnWidth(4, 250);
    }

    // Parsear el JSON recibido
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error("No se recibieron datos");
    }

    const email = data.email;
    const nombre = data.nombre || "";
    const apellido = data.apellido || "";
    const timestamp = new Date(); // Fecha y hora actuales

    if (email) {
      // Agregar los datos a una nueva fila
      sheet.appendRow([timestamp, nombre, apellido, email]);
      
      // Retornar éxito (aunque con mode:'no-cors' el frontend no leerá esto, es buena práctica)
      return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Correo guardado correctamente" }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    } else {
      throw new Error("Email no proporcionado en el JSON");
    }

  } catch (error) {
    // Retornar error
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Función auxiliar para responder a peticiones preflight OPTIONS
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
