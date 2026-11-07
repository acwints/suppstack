import Foundation
import UIKit
import Capacitor
import ShopifyCheckoutKit

@objc(SuppStackCheckoutPlugin)
public class SuppStackCheckoutPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SuppStackCheckoutPlugin"
    public let jsName = "SuppStackCheckout"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "present", returnType: CAPPluginReturnPromise)
    ]

    private var pendingPresentation: CheckoutPresentation?

    @objc func present(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [self] in
            guard self.pendingPresentation == nil else {
                call.reject("Checkout is already open.", "CHECKOUT_IN_PROGRESS")
                return
            }
            guard let value = call.getString("url"),
                  let url = URL(string: value),
                  url.scheme == "https",
                  let host = url.host, !host.isEmpty,
                  url.user == nil, url.password == nil else {
                call.reject("A secure merchant checkout URL is required.", "CHECKOUT_INVALID_URL")
                return
            }
            guard let presenter = self.bridge?.viewController,
                  presenter.view.window != nil,
                  UIApplication.shared.applicationState == .active,
                  !presenter.isBeingDismissed,
                  presenter.presentedViewController == nil else {
                call.reject("Checkout cannot be presented right now.", "CHECKOUT_NO_PRESENTER")
                return
            }
            let presentation = CheckoutPresentation { [weak self] presentation, status in
                guard self?.pendingPresentation === presentation else { return }
                self?.pendingPresentation = nil
                call.resolve(["status": status])
            }
            self.pendingPresentation = presentation
            ShopifyCheckout.configure { config in
                config.telemetry.enabled = false
            }
            ShopifyCheckout.present(checkout: url, from: presenter, delegate: presentation)
        }
    }

}

@MainActor
private final class CheckoutPresentation: CheckoutDelegate {
    private var outcome = "dismissed"
    private let onDismiss: (CheckoutPresentation, String) -> Void

    init(onDismiss: @escaping (CheckoutPresentation, String) -> Void) {
        self.onDismiss = onDismiss
    }

    func checkoutDidComplete(_ event: CheckoutCompleteEvent) {
        outcome = "completed"
    }

    func checkoutDidFail(_ event: CheckoutFailureEvent) {
        if outcome != "completed" {
            outcome = "failed"
        }
    }

    func checkoutDidDismiss() {
        onDismiss(self, outcome)
    }
}
