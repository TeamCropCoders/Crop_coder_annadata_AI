export default function VoiceButton({ text }) {
  function speak() {
    if (!window.speechSynthesis) {
      alert("Voice is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      onClick={speak}
      className="w-full rounded-2xl bg-mud px-5 py-4 font-bold text-beige shadow-soft transition hover:bg-mud/90"
    >
      Speak Advice
    </button>
  );
}
