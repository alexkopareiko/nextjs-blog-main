import { IContextContainer } from './../container';
import BaseContext from "../baseContext";
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { Request } from 'express';
import config from '../../config';
import { IIdentity } from '../common';

export default class JwtStrategy extends BaseContext {
    private _strategy: Strategy;
    private request: Request;


    get strategy() {
        return this._strategy;
    }

    constructor(opts: IContextContainer) {
        super(opts);
        console.log('jwt: initialization JWT strategy');

        this.verifyRequest = this.verifyRequest.bind(this);
        this.getJwtFromRequest = this.getJwtFromRequest.bind(this);
        console.log('before');

        this._strategy = new Strategy({
            jwtFromRequest: this.getJwtFromRequest,
            secretOrKey: config.jwtSecret,
        }, this.verifyRequest);
    }

    public verifyRequest(jwtPayload, done: VerifiedCallback) {
        const { UserService } = this.di;
        console.log('jwt: verifyRequest', jwtPayload);
        UserService.findOneByID(jwtPayload.id)
            .then(user => {
                console.log('verify request user', user);
                return done(null, {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    email: user.email,
                    // token: user.token
                });
            }).catch(err => {
                return done('Incorrect identity');
            });
    }

    public getJwtFromRequest(req: Request) {
        this.request = req;
        const getToken = ExtractJwt.fromAuthHeaderAsBearerToken();
        console.log('getToken!!!!!!!!!!!!!', getToken(req));
        console.log('COOKIES', req.cookies['token']);
        
        return getToken(req) || req.cookies['token'] || null;
    }
}

