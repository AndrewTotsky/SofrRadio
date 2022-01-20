const playBtn = document.getElementsByClassName("play-icon")[0];
const music = document.getElementById("music") as HTMLAudioElement;

interface AudioInfo {
  description: string;
  genre: string;
  listeners: string;
  name: string;
  title: string;
  url: string;
}

if (playBtn && music) {
    playBtn.addEventListener("click", () => {
        if (playBtn.id === "play-icon") {
            music.volume = 1.0
            music.play();
            music.onloadedmetadata = (event) => {
                console.log(
                    event,
                    "The duration and dimensions " +
                        "of the media and tracks are now known. "
                );
            };
            playBtn.id = "pause-icon";
        } else {
            music.pause();
            playBtn.id = "play-icon";
        }
    });
}

const loadInfoAboutCurrAudio = async () => {
    const response = await fetch("http://localhost:8000/info.xsl");
    if (response.body) {
        const rb = response.body;
        const reader = rb.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            console.log("done", done);
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                        console.log(done, value);
                        push();
                    });
                }

                push();
            },
        });
        const result = new Response(stream, {
            headers: { "Content-Type": "text/html" },
        }).text();
        // console.log(await result);
        return await result
    }
};
loadInfoAboutCurrAudio().then((resStr) => {
  if(resStr) {
    const audioInfo = JSON.parse(resStr) as AudioInfo
    const musicTitle = document.getElementsByClassName("music-title")[0]
    if(musicTitle?.innerHTML) {
      musicTitle.innerHTML = audioInfo.title
    }
    console.log('audioInfo => ', audioInfo.title)
  }
})

document.getElementById('plus')?.addEventListener('click', () => {
    console.log(music.volume)
    music.volume += 0.1
})

document.getElementById('minus')?.addEventListener('click', () => {
    console.log(music.volume)
    music.volume -= 0.1
})
