import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_facebook_login/flutter_facebook_login.dart';

import 'package:login_fresh/login_fresh.dart';
import 'package:http/http.dart' as http;

import 'package:pocketcloud/DioRequests.dart';
import 'package:pocketcloud/securestorage.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  //You have to create a list with the type of login's that you are going to import into your application
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  static final FacebookLogin facebookSignIn = new FacebookLogin();
  final SecureStorage secureStorage = SecureStorage();
  final DioRequests dioRequests = DioRequests();
  bool isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _readAll();
  }

  Future<Null> _readAll() async {
    String accessToken = await secureStorage.readSecureData('accessToken');
    if (accessToken != null) {
      print('_readAll - lendo secure storage. accessToken ' + accessToken);
      // setState(() {
      //   isLoggedIn = true;
      // });
    } else {
      print('_readAll - lendo secure storage. accessToken nulo');
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        home: isLoggedIn ? LoggedInApp() : Scaffold(body: buildLoginFresh()));
  }

  void displayDialog(context, title, text) => showDialog(
      context: context,
      builder: (context) =>
          AlertDialog(title: Text(title), content: Text(text), actions: [
            TextButton(
              child: Text('Ok'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ]));

  Future<Null> _facebookLogin(context) async {
    final FacebookLoginResult result = await facebookSignIn.logIn(['email']);

    switch (result.status) {
      case FacebookLoginStatus.loggedIn:
        final FacebookAccessToken accessToken = result.accessToken;
        var queryParameters = {
          'fields': 'name,first_name,last_name,email,picture.type(large)',
          'access_token': '${accessToken.token}',
        };
        var uri = Uri.https('graph.facebook.com', '/v2.12/me', queryParameters);
        final graphResponse = await http.get(uri);
        final profile = jsonDecode(graphResponse.body);
        // displayDialog(
        //   context,
        //   'Teste',
        //   'Conteudo',
        // );
        print('''
         Logged in!
         
         Token: ${accessToken.token}
         User id: ${accessToken.userId}
         Expires: ${accessToken.expires}
         Permissions: ${accessToken.permissions}
         Declined permissions: ${accessToken.declinedPermissions}

         NAME: ${profile['name']}
         FIRST_NAME: ${profile['first_name']}
         LAST_NAME: ${profile['last_name']}
         EMAIL: ${profile['email']}
         ID: ${profile['id']}
         PICTURE: ${profile['picture']}
         PICTURE URL: ${profile['picture']['data']['url']}
         ''');

        bool registerOk =
            await dioRequests.registerNewFacebookCustomer(accessToken, profile);
        print('FEito registerNewFacebookCustomer. Retorno: ' +
            registerOk.toString());
        if (registerOk == true) {
          setState(() {
            isLoggedIn = true;
          });
        }

        break;
      case FacebookLoginStatus.cancelledByUser:
        //_showMessage('Login cancelled by the user.');
        break;
      case FacebookLoginStatus.error:
        //_showMessage('Something went wrong with the login process.\n'
        //   'Here\'s the error Facebook gave us: ${result.errorMessage}');
        break;
    }
  }

  LoginFresh buildLoginFresh() {
    List<LoginFreshTypeLoginModel> listLogin = [
      LoginFreshTypeLoginModel(
          callFunction: (BuildContext _buildContext) {
            // develop what they want the facebook to do when the user clicks
            _facebookLogin(_buildContext);
          },
          logo: TypeLogo.facebook),
      LoginFreshTypeLoginModel(
          callFunction: (BuildContext _buildContext) {
            // develop what they want the Google to do when the user clicks
          },
          logo: TypeLogo.google),
      // LoginFreshTypeLoginModel(
      //     callFunction: (BuildContext _buildContext) {
      //       print("APPLE");
      //       // develop what they want the Apple to do when the user clicks
      //     },
      //     logo: TypeLogo.apple),
      LoginFreshTypeLoginModel(
          callFunction: (BuildContext _buildContext) {
            Navigator.of(_buildContext).push(MaterialPageRoute(
              builder: (_buildContext) => widgetLoginFreshUserAndPassword(),
            ));
          },
          logo: TypeLogo.userPassword),
    ];

    return LoginFresh(
      backgroundColor: Colors.blue,
      pathLogo: 'assets/logo.png',
      isExploreApp: false,
      functionExploreApp: () {
        // develop what they want the ExploreApp to do when the user clicks
      },
      isFooter: true,
      widgetFooter: this.widgetFooter(),
      typeLoginModel: listLogin,
      isSignUp: true,
      widgetSignUp: this.widgetLoginFreshSignUp(),
    );
  }

  Widget LoggedInApp() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Drawer Demo'),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: const <Widget>[
            DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blue,
              ),
              child: Text(
                'Drawer Header',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                ),
              ),
            ),
            ListTile(
              leading: Icon(Icons.message),
              title: Text('Messages'),
            ),
            ListTile(
              leading: Icon(Icons.account_circle),
              title: Text('Profile'),
            ),
            ListTile(
              leading: Icon(Icons.settings),
              title: Text('Settings'),
            ),
          ],
        ),
      ),
    );
  }

  Widget widgetLoginFreshUserAndPassword() {
    return LoginFreshUserAndPassword(
      callLogin: (BuildContext _context, Function isRequest, String user,
          String password) {
        isRequest(true);

        Future.delayed(Duration(seconds: 2), () {
          print('-------------- function call----------------');
          print(user);
          print(password);
          print('--------------   end call   ----------------');

          isRequest(false);
        });
      },
      backgroundColor: Colors.blue,
      logo: './assets/logo.png',
      isFooter: true,
      widgetFooter: this.widgetFooter(),
      isResetPassword: true,
      widgetResetPassword: this.widgetResetPassword(),
      isSignUp: true,
      signUp: this.widgetLoginFreshSignUp(),
    );
  }

  Widget widgetResetPassword() {
    return LoginFreshResetPassword(
      backgroundColor: Colors.blue,
      logo: 'assets/logo.png',
      funResetPassword:
          (BuildContext _context, Function isRequest, String email) {
        isRequest(true);

        Future.delayed(Duration(seconds: 2), () {
          print('-------------- function call----------------');
          print(email);
          print('--------------   end call   ----------------');
          isRequest(false);
        });
      },
      isFooter: true,
      widgetFooter: this.widgetFooter(),
    );
  }

  Widget widgetFooter() {
    return Container();
    // return LoginFreshFooter(
    //   logo: 'assets/logo_footer.png',
    //   text: 'Power by',
    //   funFooterLogin: () {
    //     // develop what they want the footer to do when the user clicks
    //   },
    // );
  }

  Widget widgetLoginFreshSignUp() {
    return LoginFreshSignUp(
        isFooter: true,
        widgetFooter: this.widgetFooter(),
        backgroundColor: Colors.blue,
        logo: 'assets/logo.png',
        funSignUp: (BuildContext _context, Function isRequest,
            SignUpModel signUpModel) {
          isRequest(true);

          print(signUpModel.email);
          print(signUpModel.password);
          print(signUpModel.repeatPassword);
          print(signUpModel.surname);
          print(signUpModel.name);

          isRequest(false);
        });
  }
}
