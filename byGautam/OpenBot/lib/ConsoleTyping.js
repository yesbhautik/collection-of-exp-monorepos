function typeWriter(text, speed) {
  return new Promise((resolve) => {
    let i = 0;

    function type() {
      if (i < text.length) {
        process.stdout.write(text.charAt(i));
        i++;
        setTimeout(type, speed);
      } else {
        console.log(); // To add a newline after typing
        resolve(); 
      }
    }

    type();
  });
}

export default typeWriter;