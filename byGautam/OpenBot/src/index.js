// MATRIX CODER ka maal he please isko Personal hi use karna

import dotenv from 'dotenv';
dotenv.config();
import { makeWASocket, Browsers, jidDecode, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './event/index.js'
import typeWriter from '../lib/ConsoleTyping.js';
import { Boom } from '@hapi/boom';
import chalk from 'chalk';
import pino from 'pino';
import fs from 'fs';
import axios from 'axios';

const logger = pino({ level: 'silent' });
let useQR;
let isSessionPutted;
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");

async function start() {
  if(!process.env.SESSION_ID) {
    useQR = true;
    isSessionPutted = false;
  } else {
    useQR = false;
    isSessionPutted = true;
  }
   
  await typeWriter(orange("CODED BY GOUTAM KUMAR"), 100);
  //Baileys Device Configuration
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const Matrix = makeWASocket({
    logger: logger,
    printQRInTerminal: useQR,
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true,
    auth: state,
  });

 // Manage Device Loging
 if (!Matrix.authState.creds.registered && isSessionPutted) {
    const sessionID = process.env.SESSION_ID;
    const pasteUrl = `https://pastebin.com/raw/${sessionID}`;
    const response = await fetch(pasteUrl);
    const text = await response.text();
    if (typeof text === 'string') {
      fs.writeFileSync('./session/creds.json', text);
      await start()
    }
  }
  
    // Handle Incomming Messages
  Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
  Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
  Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));
  
  // Check Socket Connection
  Matrix.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`);
        Matrix.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        start();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        start();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
        Matrix.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`);
        Matrix.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        start();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        start();
      } else if (reason === DisconnectReason.Multidevicemismatch) {
        console.log("Multi device mismatch, please scan again");
        Matrix.logout();
      } else {
        Matrix.end(`Unknown DisconnectReason: ${reason}|${connection}`);
      }
    } else if (connection === "open") {
      console.log(lime("😃 Initigration Sucsessed️ ✅"));
      Matrix.sendMessage(Matrix.user.id, { text: `😃 Initigration Sucsessed️ ✅` });
    }
  });
}

start();