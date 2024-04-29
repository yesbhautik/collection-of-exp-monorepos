const Callupdate = async (json, Matrix) => {
  for (const id of json) {
    if (id.status === "offer") {
      let msg = await Matrix.sendMessage(id.from, {
        text: `Anti Call is Enabled`,
        mentions: [id.from],
      });
      await Matrix.rejectCall(id.id, id.from);
    }
  }
};

export default Callupdate;
