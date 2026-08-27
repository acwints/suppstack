import Foundation
import AuthenticationServices
import Capacitor

@objc(SuppStackAppleSignInPlugin)
public class SuppStackAppleSignInPlugin: CAPPlugin, CAPBridgedPlugin,
    ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "SuppStackAppleSignInPlugin"
    public let jsName = "SuppStackAppleSignIn"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise)
    ]

    private var pendingCall: CAPPluginCall?
    private var authorizationController: ASAuthorizationController?
    private weak var presentationWindow: UIWindow?

    @objc func authorize(_ call: CAPPluginCall) {
        guard pendingCall == nil else {
            call.reject(
                "A Sign in with Apple request is already in progress.",
                "APPLE_SIGN_IN_IN_PROGRESS"
            )
            return
        }

        guard let nonce = call.getString("nonce"), !nonce.isEmpty else {
            call.reject("A secure nonce is required.", "APPLE_SIGN_IN_INVALID_NONCE")
            return
        }

        guard let window = bridge?.viewController?.view.window else {
            call.reject(
                "Sign in with Apple could not be presented. Please try again.",
                "APPLE_SIGN_IN_NO_WINDOW"
            )
            return
        }

        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = nonce

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self

        pendingCall = call
        authorizationController = controller
        presentationWindow = window
        controller.performRequests()
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return presentationWindow ?? ASPresentationAnchor()
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard let call = takePendingCall() else { return }
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            call.reject(
                "Apple returned an unsupported credential.",
                "APPLE_SIGN_IN_INVALID_CREDENTIAL"
            )
            return
        }
        guard
            let tokenData = credential.identityToken,
            let identityToken = String(data: tokenData, encoding: .utf8),
            !identityToken.isEmpty
        else {
            call.reject(
                "Apple did not return an identity token. Please try again.",
                "APPLE_SIGN_IN_MISSING_TOKEN"
            )
            return
        }

        var result: JSObject = [
            "identityToken": identityToken,
            "userIdentifier": credential.user
        ]

        if let codeData = credential.authorizationCode,
           let authorizationCode = String(data: codeData, encoding: .utf8) {
            result["authorizationCode"] = authorizationCode
        }
        if let email = credential.email { result["email"] = email }
        if let givenName = credential.fullName?.givenName { result["givenName"] = givenName }
        if let familyName = credential.fullName?.familyName { result["familyName"] = familyName }

        call.resolve(result)
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        guard let call = takePendingCall() else { return }

        if let authorizationError = error as? ASAuthorizationError,
           authorizationError.code == .canceled {
            call.reject(
                "Sign in was cancelled.",
                "APPLE_SIGN_IN_CANCELLED",
                authorizationError
            )
            return
        }

        call.reject(
            "Sign in with Apple could not be completed. Please try again.",
            "APPLE_SIGN_IN_FAILED",
            error
        )
    }

    private func takePendingCall() -> CAPPluginCall? {
        let call = pendingCall
        pendingCall = nil
        authorizationController = nil
        presentationWindow = nil
        return call
    }
}
