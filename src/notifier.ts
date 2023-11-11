export class Notifier {
    public sendMessage(message: string): Promise<void> {
        console.log(`Notifying: ${message}`);

        return Promise.resolve();
    }
}