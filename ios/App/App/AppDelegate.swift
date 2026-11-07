import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// Kept in this target's existing source file so Xcode Cloud compiles the delegate.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    private var launchObserver: NSObjectProtocol?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard !connectionOptions.urlContexts.isEmpty || !connectionOptions.userActivities.isEmpty else { return }
        // Cold-start callbacks must wait until the bridge has registered its plugins.
        launchObserver = NotificationCenter.default.addObserver(forName: .capacitorViewDidAppear, object: nil, queue: .main) { [weak self] _ in
            guard let self else { return }
            if let launchObserver = self.launchObserver {
                NotificationCenter.default.removeObserver(launchObserver)
                self.launchObserver = nil
            }
            self.scene(scene, openURLContexts: connectionOptions.urlContexts)
            for activity in connectionOptions.userActivities {
                self.scene(scene, continue: activity)
            }
        }
    }

    deinit {
        if let launchObserver {
            NotificationCenter.default.removeObserver(launchObserver)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: [
                .sourceApplication: context.options.sourceApplication as Any,
                .openInPlace: context.options.openInPlace
            ])
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}
